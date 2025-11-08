"use client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, Book, MessageSquare, Video, FileText, Search, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Book,
      items: [
        {
          question: "How do I get started with Quantra?",
          answer: "To get started, simply sign in with your credentials. If you don't have an account, contact your administrator. Once logged in, you'll have access to the dashboard where you can monitor fraud detection, KYC verifications, and AML cases.",
        },
        {
          question: "What is the purpose of Quantra?",
          answer: "Quantra is an Enterprise Risk Intelligence Platform that provides AI-powered fraud detection, AML case management, and KYC verification for modern financial institutions. It helps you monitor transactions, detect suspicious activities, and manage compliance cases.",
        },
        {
          question: "How do I navigate the platform?",
          answer: "Use the sidebar menu to navigate between different sections: Dashboard, KYC Verification, Fraud Detection, AML Cases, and Credit Forecast. The top bar provides quick access to search, notifications, and your profile.",
        },
      ],
    },
    {
      title: "Fraud Detection",
      icon: HelpCircle,
      items: [
        {
          question: "How does fraud detection work?",
          answer: "Our AI-powered fraud detection system analyzes transaction patterns, user behavior, and various risk factors in real-time. Transactions are scored based on multiple criteria including amount, location, merchant, and historical patterns. High-risk transactions are automatically flagged for review.",
        },
        {
          question: "What should I do with flagged transactions?",
          answer: "Flagged transactions require manual review. Click on a flagged transaction to see detailed information including the fraud score, risk factors, and transaction history. You can then approve, reject, or escalate the transaction based on your analysis.",
        },
        {
          question: "How accurate is the fraud detection?",
          answer: "Our fraud detection system uses advanced machine learning models trained on historical data. The system continuously learns and improves, achieving high accuracy rates. However, all flagged transactions should be reviewed by analysts to ensure accuracy.",
        },
      ],
    },
    {
      title: "KYC Verification",
      icon: FileText,
      items: [
        {
          question: "What is KYC verification?",
          answer: "KYC (Know Your Customer) verification is the process of verifying the identity of users. This includes checking identification documents, verifying personal information, and assessing risk levels. Users must complete KYC verification before accessing certain features.",
        },
        {
          question: "How do I review KYC submissions?",
          answer: "Navigate to the KYC Verification page to see all pending submissions. Click on a submission to view uploaded documents and user information. You can approve, reject, or request additional information based on your review.",
        },
        {
          question: "What documents are required for KYC?",
          answer: "Typically, users need to provide government-issued ID (passport, driver's license, or national ID), proof of address (utility bill or bank statement), and sometimes additional documents depending on the risk level and jurisdiction requirements.",
        },
      ],
    },
    {
      title: "AML Cases",
      icon: HelpCircle,
      items: [
        {
          question: "What are AML cases?",
          answer: "AML (Anti-Money Laundering) cases are investigations into suspicious activities that may indicate money laundering or other financial crimes. These cases are created when transactions or patterns trigger AML alerts based on regulatory requirements and risk factors.",
        },
        {
          question: "How do I manage AML cases?",
          answer: "Go to the AML Cases page to view all active cases. Each case shows the alert details, assigned analyst, status, and notes. You can assign cases, update status, add notes, and resolve cases once the investigation is complete.",
        },
        {
          question: "What information should I include in case notes?",
          answer: "Case notes should include investigation findings, actions taken, evidence reviewed, and conclusions. Clear and detailed notes help with case resolution and provide an audit trail for compliance purposes.",
        },
      ],
    },
    {
      title: "Credit Forecast",
      icon: FileText,
      items: [
        {
          question: "What is credit forecasting?",
          answer: "Credit forecasting uses machine learning models to predict future spending patterns and default risk for users. This helps financial institutions make informed decisions about credit limits, loan approvals, and risk management.",
        },
        {
          question: "How accurate are the forecasts?",
          answer: "Our forecasting models are trained on historical transaction data and use advanced algorithms to predict future behavior. Accuracy varies based on data quality and user history, but the models are continuously improved with new data.",
        },
        {
          question: "How do I interpret forecast results?",
          answer: "Forecast results show predicted spending amounts and default risk scores. Higher default risk scores indicate users who may have difficulty repaying. Use these insights along with other factors to make credit decisions.",
        },
      ],
    },
  ];

  const filteredFAQs = faqCategories.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground mt-2">
            Find answers to common questions and get help using Quantra
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Book className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive guides and documentation
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Step-by-step video guides
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Chat with our support team
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  support@quantra.com
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5" />
                <CardTitle>Search Help Articles</CardTitle>
              </div>
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="space-y-6">
            {filteredFAQs.map((category, categoryIndex) => (
              <Card key={category.title}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-primary" />
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem
                        key={`${category.title}-${itemIndex}`}
                        value={`${category.title}-${itemIndex}`}
                      >
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {filteredFAQs.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="py-12 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-muted-foreground">
                  Try searching with different keywords or contact support for assistance.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Still need help?</CardTitle>
              <CardDescription>
                Our support team is here to assist you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Start Live Chat
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}

