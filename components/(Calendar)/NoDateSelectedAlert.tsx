import React from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, Terminal } from "lucide-react";

const NoDateSelectedAlert = () => {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>Please select a date first.</AlertDescription>
    </Alert>
  );
};

export default NoDateSelectedAlert;
