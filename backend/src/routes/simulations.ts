/**
 * Simulations Route
 * 
 * Endpoints for AI simulation management:
 * - POST /simulate - Start a new AI simulation
 * - GET /simulations - View all simulations
 * - GET /simulations/:id - Get simulation results
 * - GET /metrics - Get aggregated statistics
 * - DELETE /simulations/:id - Delete a specific simulation
 * - DELETE /simulations - Clear all simulations
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  simulateAIProcessing, 
  SimulationInput,
  calculateAggregatedMetrics,
  AggregatedMetrics
} from '../services/simulationService';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /simulate
 * Start a new AI simulation
 * 
 * Request body:
 * {
 *   "name": "My Simulation",
 *   "data": { ... },
 *   "type": "prediction" | "pattern" | "classification" | "analysis",
 *   "parameters": { ... }
 * }
 */
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    console.log('📥 Received simulation request');
    
    const { name, data, type, parameters } = req.body;
    
    if (!data) {
      return res.status(400).json({ 
        error: 'data field is required' 
      });
    }
    
    const simulationName = name || `Simulation-${Date.now()}`;
    
    // Create simulation record with pending status
    const simulation = await prisma.simulation.create({
      data: {
        name: simulationName,
        status: 'pending',
        inputData: data as any
      }
    });
    
    console.log(`✅ Created simulation record: ${simulation.id}`);
    
    // Update status to running
    await prisma.simulation.update({
      where: { id: simulation.id },
      data: { status: 'running' }
    });
    
    console.log(`🔄 Simulation status: running`);
    
    // Run AI simulation
    const input: SimulationInput = {
      name: simulationName,
      data,
      type,
      parameters
    };
    
    let result;
    try {
      result = await simulateAIProcessing(input);
      
      // Save output and metrics
      await prisma.simulation.update({
        where: { id: simulation.id },
        data: {
          status: 'completed',
          outputData: result.output as any
        }
      });
      
      // Save metrics
      await prisma.aiMetric.create({
        data: {
          simulationId: simulation.id,
          accuracy: result.metrics.accuracy,
          loss: result.metrics.loss,
          duration: result.metrics.duration
        }
      });
      
      console.log(`✅ Simulation completed: ${simulation.id}`);
      
      res.status(201).json({
        id: simulation.id,
        name: simulation.name,
        status: 'completed',
        input: data,
        output: result.output,
        metrics: result.metrics,
        createdAt: simulation.createdAt,
        updatedAt: new Date()
      });
    } catch (error: any) {
      // Mark simulation as failed
      await prisma.simulation.update({
        where: { id: simulation.id },
        data: { status: 'failed' }
      });
      
      console.error(`❌ Simulation failed: ${error.message}`);
      
      res.status(500).json({
        id: simulation.id,
        status: 'failed',
        error: error.message
      });
    }
  } catch (error: any) {
    console.error(`❌ Error creating simulation: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /simulations
 * View all simulations
 * 
 * Query parameters:
 * - status: Filter by status (pending, running, completed, failed)
 * - limit: Limit number of results (default: 50)
 * - offset: Offset for pagination (default: 0)
 */
router.get('/simulations', async (req: Request, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    const where = status ? { status: status as string } : {};
    
    const simulations = await prisma.simulation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 1 // Get latest metric
        }
      }
    });
    
    const total = await prisma.simulation.count({ where });
    
    res.json({
      simulations: simulations.map((sim: any) => ({
        id: sim.id,
        name: sim.name,
        status: sim.status,
        inputData: sim.inputData,
        outputData: sim.outputData,
        metrics: sim.metrics[0] || null,
        createdAt: sim.createdAt,
        updatedAt: sim.updatedAt
      })),
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error: any) {
    console.error(`❌ Error fetching simulations: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /simulations/:id
 * Get simulation results by ID
 */
router.get('/simulations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const simulation = await prisma.simulation.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });
    
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    res.json({
      id: simulation.id,
      name: simulation.name,
      status: simulation.status,
      inputData: simulation.inputData,
      outputData: simulation.outputData,
      metrics: simulation.metrics,
      createdAt: simulation.createdAt,
      updatedAt: simulation.updatedAt
    });
  } catch (error: any) {
    console.error(`❌ Error fetching simulation: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /metrics
 * Get aggregated statistics across all simulations
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    console.log('📊 Calculating aggregated metrics');
    
    const simulations = await prisma.simulation.findMany({
      include: {
        metrics: true
      }
    });
    
    const aggregatedMetrics = calculateAggregatedMetrics(
      simulations.map((sim: any) => ({
        status: sim.status,
        metrics: sim.metrics.map((m: any) => ({
          accuracy: m.accuracy,
          loss: m.loss,
          duration: m.duration
        }))
      }))
    );
    
    console.log(`✅ Aggregated metrics calculated`);
    console.log(`📈 Total simulations: ${aggregatedMetrics.totalSimulations}`);
    console.log(`📊 Average accuracy: ${(aggregatedMetrics.averageAccuracy * 100).toFixed(2)}%`);
    
    res.json(aggregatedMetrics);
  } catch (error: any) {
    console.error(`❌ Error calculating metrics: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /simulations/:id
 * Delete a specific simulation
 */
router.delete('/simulations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️  Deleting simulation: ${id}`);
    
    const simulation = await prisma.simulation.findUnique({
      where: { id }
    });
    
    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }
    
    // Delete simulation (metrics will be cascade deleted)
    await prisma.simulation.delete({
      where: { id }
    });
    
    console.log(`✅ Simulation deleted: ${id}`);
    
    res.json({ 
      message: 'Simulation deleted successfully',
      id 
    });
  } catch (error: any) {
    console.error(`❌ Error deleting simulation: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /simulations
 * Clear all simulations
 */
router.delete('/simulations', async (req: Request, res: Response) => {
  try {
    console.log('🗑️  Clearing all simulations');
    
    // Delete all metrics first (due to foreign key constraint)
    await prisma.aiMetric.deleteMany({});
    
    // Delete all simulations
    const result = await prisma.simulation.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} simulations`);
    
    res.json({ 
      message: 'All simulations cleared successfully',
      deletedCount: result.count
    });
  } catch (error: any) {
    console.error(`❌ Error clearing simulations: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;

