"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TrainResponse {
  test_metrics: { [key: string]: number };
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
  const [nEstimators, setNEstimators] = useState<number>(100);
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [maxDepth, setMaxDepth] = useState<number>(5);
  const [minChildWeight, setMinChildWeight] = useState<number>(1.0);
  const [gamma, setGamma] = useState<number>(0.0);
  const [subsample, setSubsample] = useState<number>(0.8);
  const [colsampleBytree, setColsampleBytree] = useState<number>(0.8);
  const [testSize, setTestSize] = useState<number>(0.2);
  const [validationSize, setValidationSize] = useState<number>(0.2);
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
      const response = await fetch("https://xgbregressor.bhaweshagrawal.com.np/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Train API failed with status ${response.status}`);
      const data: TrainResponse = await response.json();
      setTrainData(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching train data.");
      console.error("Train Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPlotImage = () => {
    if (!trainData) return null;
    switch (plotType) {
      case "training": return trainData.training_history_plots;
      case "feature": return trainData.feature_importance_plot;
      case "prediction": return trainData.predictions_plot;
      case "scatter": return trainData.residuals_plots;
      case "derivative": return trainData.residuals_distribution_plots;
      default: return null;
    }
  };

  const metricExplanations: { [key: string]: string } = {
    mae: "Mean Absolute Error: Average absolute difference between predicted and actual values.",
    mse: "Mean Squared Error: Average squared difference between predicted and actual values.",
    rmse: "Root Mean Squared Error: Square root of MSE, in the same units as the target.",
    r2: "R² Score: Proportion of variance in the dependent variable explained by the model.",
  };

  const formatMetrics = (metrics: { [key: string]: number }) => {
    if (!metrics) return null;
    return Object.entries(metrics).map(([key, value]) => (
      <div key={key} className="flex justify-between py-1">
        <Popover>
          <PopoverTrigger asChild>
            <span className="font-medium capitalize cursor-pointer underline">
              {key.replace("_", " ")}:
            </span>
          </PopoverTrigger>
          <PopoverContent>
            <p className="text-sm">{metricExplanations[key] || "Metric explanation not available."}</p>
          </PopoverContent>
        </Popover>
        <span>{value.toFixed(4)}</span>
      </div>
    ));
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
            <CardTitle className="text-lg dark:text-white">Data Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Progress value={50} className="w-full mb-4" />
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : trainData ? (
              <div className="flex justify-center">
                {(() => {
                  const imageSrc = getPlotImage();
                  if (!imageSrc) return <p className="text-red-500">No image data for {plotType}</p>;
                  return (
                    <img
                      src={imageSrc}
                      alt={plotType}
                      className="max-w-full h-auto rounded-md shadow-sm"
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Selected Plot Type: {plotType}</p>
                <p className="mt-4">Click "Fetch Data" to load results from the API.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full lg:w-1/4 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Hyperparameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="nEstimators" className="dark:text-white">n_estimators: {nEstimators}</Label>
              <Slider id="nEstimators" value={[nEstimators]} onValueChange={(value) => setNEstimators(value[0])} min={10} max={1000} step={10} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="learningRate" className="dark:text-white">Learning Rate: {learningRate}</Label>
              <Slider id="learningRate" value={[learningRate]} onValueChange={(value) => setLearningRate(value[0])} min={0.01} max={1} step={0.01} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="maxDepth" className="dark:text-white">Max Depth: {maxDepth}</Label>
              <Slider id="maxDepth" value={[maxDepth]} onValueChange={(value) => setMaxDepth(value[0])} min={1} max={20} step={1} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="minChildWeight" className="dark:text-white">Min Child Weight: {minChildWeight}</Label>
              <Slider id="minChildWeight" value={[minChildWeight]} onValueChange={(value) => setMinChildWeight(value[0])} min={0.1} max={10} step={0.1} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="gamma" className="dark:text-white">Gamma: {gamma}</Label>
              <Slider id="gamma" value={[gamma]} onValueChange={(value) => setGamma(value[0])} min={0} max={5} step={0.1} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="subsample" className="dark:text-white">Subsample: {subsample}</Label>
              <Slider id="subsample" value={[subsample]} onValueChange={(value) => setSubsample(value[0])} min={0.1} max={1} step={0.05} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="colsampleBytree" className="dark:text-white">Colsample Bytree: {colsampleBytree}</Label>
              <Slider id="colsampleBytree" value={[colsampleBytree]} onValueChange={(value) => setColsampleBytree(value[0])} min={0.1} max={1} step={0.05} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="testSize" className="dark:text-white">Test Size: {testSize}</Label>
              <Slider id="testSize" value={[testSize]} onValueChange={(value) => setTestSize(value[0])} min={0.1} max={0.5} step={0.05} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="validationSize" className="dark:text-white">Validation Size: {validationSize}</Label>
              <Slider id="validationSize" value={[validationSize]} onValueChange={(value) => setValidationSize(value[0])} min={0.1} max={0.5} step={0.05} className="mt-2" />
            </div>
            <Button className="w-full" onClick={fetchTrainData} disabled={loading}>
              {loading ? "Fetching..." : "Fetch Data"}
            </Button>
            {trainData && (
              <div className="mt-6">
                <Label className="text-lg font-semibold dark:text-white">Test Metrics</Label>
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                  {formatMetrics(trainData.test_metrics)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}