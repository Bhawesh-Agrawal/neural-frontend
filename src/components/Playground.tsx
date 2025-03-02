"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"; // Added Button import

interface TrainResponse {
  test_metrics: Record<string, number>;
  training_history_plots: string;
  feature_importance_plot: string;
  predictions_plot: string;
  residuals_plots: string;
  residuals_distribution_plots: string;
  data_split: {
    train_size: number;
    validation_size: number;
    test_size: number;
  };
}

export default function Playground() {
  const [plotType, setPlotType] = useState<string>("training");
  const [nEstimators] = useState<number>(100);
  const [learningRate] = useState<number>(0.1);
  const [maxDepth] = useState<number>(5);
  const [minChildWeight] = useState<number>(1.0);
  const [gamma] = useState<number>(0.0);
  const [subsample] = useState<number>(0.8);
  const [colsampleBytree] = useState<number>(0.8);
  const [testSize] = useState<number>(0.2);
  const [validationSize] = useState<number>(0.2);
  const [trainData, setTrainData] = useState<TrainResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainData = async () => {
    setLoading(true);
    setError(null);
    setTrainData(null);

    const payload = {
      n_estimators: nEstimators,
      learning_rate: learningRate,
      max_depth: maxDepth,
      min_child_weight: minChildWeight,
      gamma: gamma,
      subsample: subsample,
      colsample_bytree: colsampleBytree,
      test_size: testSize,
      validation_size: validationSize,
    };

    try {
      const response = await fetch(
        "https://xgbregressor.bhaweshagrawal.com.np/train",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok)
        throw new Error(`Train API failed with status ${response.status}`);
      const data: TrainResponse = await response.json();
      setTrainData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching train data.");
      } else {
        setError("An unknown error occurred.");
      }
      console.error("Train Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPlotImage = () => {
    if (!trainData) return null;
    switch (plotType) {
      case "training":
        return trainData.training_history_plots;
      case "feature":
        return trainData.feature_importance_plot;
      case "prediction":
        return trainData.predictions_plot;
      case "scatter":
        return trainData.residuals_plots;
      case "derivative":
        return trainData.residuals_distribution_plots;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900">
      <div className="mb-6 flex justify-center">
        <Select value={plotType} onValueChange={setPlotType}>
          <SelectTrigger className="w-[300px] bg-white dark:bg-gray-800 shadow-sm">
            <SelectValue placeholder="Select Plot Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="training">Training History</SelectItem>
            <SelectItem value="feature">Feature Importance</SelectItem>
            <SelectItem value="prediction">Prediction Plot</SelectItem>
            <SelectItem value="scatter">Residual Scatter Plot</SelectItem>
            <SelectItem value="derivative">Residual Derivative Plot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="w-full lg:w-3/4 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">
              Data Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={fetchTrainData}
              disabled={loading}
              className="mb-4 w-full lg:w-auto"
            >
              {loading ? "Fetching..." : "Fetch Data"}
            </Button>
            {loading ? (
              <Progress value={50} className="w-full mb-4" />
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : trainData ? (
              <div className="flex justify-center">
                {(() => {
                  const imageSrc = getPlotImage();
                  if (!imageSrc)
                    return (
                      <p className="text-red-500">
                        No image data for {plotType}
                      </p>
                    );
                  return (
                    <Image
                      src={imageSrc}
                      alt={plotType}
                      width={500}
                      height={300}
                      className="max-w-full h-auto rounded-md shadow-sm"
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Selected Plot Type: {plotType}</p>
                <p className="mt-4">
                  Click &quot;Fetch Data&quot; to load results from the API.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
