"""
Master training script
Runs all model training scripts
"""

import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = BASE_DIR / "scripts"

def run_training_script(script_name):
    """Run a training script"""
    script_path = SCRIPTS_DIR / script_name
    
    if not script_path.exists():
        print(f"Warning: Script {script_name} not found. Skipping...")
        return False
    
    print(f"\n{'='*60}")
    print(f"Running {script_name}")
    print(f"{'='*60}\n")
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=BASE_DIR,
            check=True,
            capture_output=False
        )
        print(f"\n✓ {script_name} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n✗ {script_name} failed with error: {e}")
        return False

def main():
    """Run all training scripts"""
    print("=" * 60)
    print("Quantra Model Training - Master Script")
    print("=" * 60)
    
    scripts = [
        "train_fraud_model.py",
        "train_forecast_model.py",
        "train_kyc_models.py",
        "train_simulation_models.py"
    ]
    
    results = {}
    
    for script in scripts:
        results[script] = run_training_script(script)
    
    # Summary
    print("\n" + "=" * 60)
    print("Training Summary")
    print("=" * 60)
    
    successful = sum(1 for v in results.values() if v)
    total = len(results)
    
    for script, success in results.items():
        status = "✓ Success" if success else "✗ Failed"
        print(f"{script}: {status}")
    
    print(f"\nTotal: {successful}/{total} scripts completed successfully")
    
    if successful == total:
        print("\n🎉 All models trained successfully!")
    else:
        print("\n⚠️  Some models failed to train. Check errors above.")

if __name__ == "__main__":
    main()

