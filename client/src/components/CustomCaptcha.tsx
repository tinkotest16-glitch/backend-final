import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

interface CustomCaptchaProps {
  onVerify: (success: boolean) => void;
}

export function CustomCaptcha({ onVerify }: CustomCaptchaProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [calculation, setCalculation] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);

  const generateCalculation = () => {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    if (operation === '+') {
      return {
        question: `${num1} + ${num2} = ?`,
        answer: num1 + num2
      };
    } else {
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      return {
        question: `${larger} - ${smaller} = ?`,
        answer: larger - smaller
      };
    }
  };

  const handleCheck = () => {
    setIsChecked(!isChecked);
    if (!isChecked) {
      const newCalculation = generateCalculation();
      setCalculation(newCalculation);
      setShowCalculation(true);
    }
  };

  const handleSubmitAnswer = () => {
    if (parseInt(userAnswer) === calculation.answer) {
      setShowCalculation(false);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setUserAnswer('');
      const newCalculation = generateCalculation();
      setCalculation(newCalculation);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 p-4 border rounded bg-white dark:bg-gray-800">
        <Checkbox
          id="robot"
          checked={isChecked}
          onCheckedChange={handleCheck}
        />
        <Label htmlFor="robot" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          I'm not a robot
        </Label>
      </div>

      <Dialog open={showCalculation} onOpenChange={setShowCalculation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Please solve this calculation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="text-lg font-mono">{calculation.question}</div>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Enter your answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className={error ? "border-red-500" : ""}
              />
              {error && (
                <p className="text-sm text-red-500">
                  Incorrect answer. Please try again with the new calculation.
                </p>
              )}
            </div>
            <Button onClick={handleSubmitAnswer} className="w-full">
              Verify
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
