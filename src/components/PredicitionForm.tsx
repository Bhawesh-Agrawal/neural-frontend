"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import jsPDF from "jspdf";

interface PredictResponse {
  prediction: number;
}

interface AnalysisItem {
  feature: string;
  importance: number;
  impact: "positive" | "negative";
  recommendation: string;
}

export default function PredictionForm() {
  const [formData, setFormData] = useState({
    delay: "",
    aircraftUtilization: "",
    turnaroundTime: "",
    loadFactor: "",
    fleetAvailability: "",
    maintenanceDowntime: "",
    fuelEfficiency: "",
    revenue: "",
    operatingCost: "",
    netProfitMargin: "",
    ancillaryRevenue: "",
    debtToEquity: "",
    revenuePerAsk: "",
    costPerAsk: "",
  });
  const [predictData, setPredictData] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    setPredictData(null);

    const features = [
      parseFloat(formData.delay) || 0,
      parseFloat(formData.aircraftUtilization) || 0,
      parseFloat(formData.turnaroundTime) || 0,
      parseFloat(formData.loadFactor) || 0,
      parseFloat(formData.fleetAvailability) || 0,
      parseFloat(formData.maintenanceDowntime) || 0,
      parseFloat(formData.fuelEfficiency) || 0,
      parseFloat(formData.revenue) || 0,
      parseFloat(formData.operatingCost) || 0,
      parseFloat(formData.netProfitMargin) || 0,
      parseFloat(formData.ancillaryRevenue) || 0,
      parseFloat(formData.debtToEquity) || 0,
      parseFloat(formData.revenuePerAsk) || 0,
      parseFloat(formData.costPerAsk) || 0,
    ];

    const payload = { features };

    try {
      const response = await fetch(
        "https://xgbregressor.bhaweshagrawal.com.np/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok)
        throw new Error(`Predict API failed with status ${response.status}`);
      const data: PredictResponse = await response.json();
      setPredictData(data);
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      if (err instanceof Error) {
        setError(err.message || "An error occurred while predicting.");
      } else {
        setError("An unknown error occurred.");
      }
      console.error("Predict Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Profit Prediction", 10, 10);
    doc.text(
      `Predicted Profit: ${predictData?.prediction.toFixed(2)} USD`,
      10,
      20
    );
    doc.text("Profitability Analysis", 10, 30);
    analysisBoard.forEach((item, index) => {
      doc.text(
        `${item.feature} (${item.importance}%): ${
          item.impact === "positive" ? "Increases" : "Decreases"
        } Profit - ${item.recommendation}`,
        10,
        40 + index * 10
      );
    });
    doc.save("profit_analysis.pdf");
  };

  const formFields = [
    {
      name: "delay",
      label: "Delay (Minutes)",
      description: "Average delay time per flight in minutes.",
    },
    {
      name: "aircraftUtilization",
      label: "Aircraft Utilization (Hours/Day)",
      description: "Average hours per day an aircraft is in use.",
    },
    {
      name: "turnaroundTime",
      label: "Turnaround Time (Minutes)",
      description: "Time taken to prepare an aircraft for its next flight.",
    },
    {
      name: "loadFactor",
      label: "Load Factor (%)",
      description: "Percentage of seats filled on average.",
    },
    {
      name: "fleetAvailability",
      label: "Fleet Availability (%)",
      description: "Percentage of the fleet available for operations.",
    },
    {
      name: "maintenanceDowntime",
      label: "Maintenance Downtime (Hours)",
      description: "Total hours aircraft are out of service for maintenance.",
    },
    {
      name: "fuelEfficiency",
      label: "Fuel Efficiency (ASK)",
      description: "Fuel efficiency measured in Available Seat Kilometers.",
    },
    {
      name: "revenue",
      label: "Revenue (USD)",
      description: "Total revenue generated from operations in USD.",
    },
    {
      name: "operatingCost",
      label: "Operating Cost (USD)",
      description: "Total cost of operations in USD.",
    },
    {
      name: "netProfitMargin",
      label: "Net Profit Margin (%)",
      description: "Percentage of revenue remaining after expenses.",
    },
    {
      name: "ancillaryRevenue",
      label: "Ancillary Revenue (USD)",
      description: "Additional revenue from non-ticket sources in USD.",
    },
    {
      name: "debtToEquity",
      label: "Debt-to-Equity Ratio",
      description: "Ratio of total debt to shareholders' equity.",
    },
    {
      name: "revenuePerAsk",
      label: "Revenue per ASK",
      description: "Revenue per Available Seat Kilometer.",
    },
    {
      name: "costPerAsk",
      label: "Cost per ASK",
      description: "Operating cost per Available Seat Kilometer.",
    },
  ];

  const analysisBoard: AnalysisItem[] = [
    {
      feature: "Load Factor (%)",
      importance: 90,
      impact: "positive" as const,
      recommendation:
        "Increase load factor by optimizing pricing and marketing to fill more seats.",
    },
    {
      feature: "Revenue (USD)",
      importance: 85,
      impact: "positive" as const,
      recommendation:
        "Boost revenue through higher ticket sales or premium offerings.",
    },
    {
      feature: "Operating Cost (USD)",
      importance: 80,
      impact: "negative" as const,
      recommendation:
        "Reduce operating costs by negotiating supplier contracts or optimizing routes.",
    },
    {
      feature: "Revenue per ASK",
      importance: 75,
      impact: "positive" as const,
      recommendation:
        "Increase Revenue per ASK by optimizing ticket pricing strategies, upselling premium seats, or enhancing loyalty programs.",
    },
    {
      feature: "Delay (Minutes)",
      importance: 70,
      impact: "negative" as const,
      recommendation:
        "Minimize delays through better scheduling and operational efficiency.",
    },
    {
      feature: "Cost per ASK",
      importance: 70,
      impact: "negative" as const,
      recommendation:
        "Reduce Cost per ASK by improving fuel efficiency, streamlining operations, or renegotiating fixed costs like leasing agreements.",
    },
    {
      feature: "Aircraft Utilization (Hours/Day)",
      importance: 65,
      impact: "positive" as const,
      recommendation:
        "Maximize aircraft utilization by increasing flight frequency.",
    },
    {
      feature: "Fuel Efficiency (ASK)",
      importance: 60,
      impact: "positive" as const,
      recommendation:
        "Improve fuel efficiency with modern aircraft or route planning.",
    },
    {
      feature: "Ancillary Revenue (USD)",
      importance: 55,
      impact: "positive" as const,
      recommendation:
        "Enhance ancillary revenue with in-flight sales or baggage fees.",
    },
    {
      feature: "Maintenance Downtime (Hours)",
      importance: 50,
      impact: "negative" as const,
      recommendation:
        "Reduce maintenance downtime with proactive upkeep schedules.",
    },
  ].sort((a, b) => b.importance - a.importance);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-lg dark:text-white">
            Prediction Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={field.name} className="dark:text-white">
                    {field.label}
                  </Label>
                  <Popover open={openPopover === field.name}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 rounded-full flex items-center justify-center bg-yellow-100 hover:bg-yellow-200 border-none"
                        onMouseEnter={() => setOpenPopover(field.name)}
                        onMouseLeave={() => setOpenPopover(null)}
                      >
                        <span className="text-yellow-600 italic text-xs">
                          i
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {field.description}
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleInputChange}
                  className="mt-1 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter value"
                />
              </div>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={fetchPrediction}
            disabled={loading}
          >
            {loading ? "Predicting..." : "Predict"}
          </Button>
          {loading && <Progress value={50} className="w-full" />}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {predictData && (
            <>
              <div className="mt-4 text-center">
                <Label className="text-lg font-semibold dark:text-white">
                  Predicted Profit:
                </Label>
                <p className="text-2xl font-bold mt-2 dark:text-white">
                  {predictData.prediction.toFixed(2)} USD
                </p>
              </div>
              <div className="mt-6">
                <Label className="text-lg font-semibold dark:text-white">
                  Profitability Analysis Board
                </Label>
                <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm shadow-sm">
                  <div className="grid grid-cols-3 gap-2 font-semibold border-b pb-2 dark:text-white">
                    <span>Feature</span>
                    <span>Impact</span>
                    <span>Recommendation</span>
                  </div>
                  {analysisBoard.map((item) => (
                    <div
                      key={item.feature}
                      className="grid grid-cols-3 gap-2 py-2 border-b last:border-b-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="dark:text-white">
                        {item.feature} ({item.importance}%)
                      </span>
                      <span
                        className={
                          item.impact === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {item.impact === "positive"
                          ? "Increases Profit"
                          : "Decreases Profit"}
                      </span>
                      <span className="dark:text-white">
                        {item.recommendation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full mt-4" onClick={exportToPDF}>
                Export to PDF
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
