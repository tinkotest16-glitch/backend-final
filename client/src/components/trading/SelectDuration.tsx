import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectDurationProps {
  value: string;
  onChange: (value: string) => void;
}

export function SelectDuration({ value, onChange }: SelectDurationProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="trading-select mt-1">
        <SelectValue placeholder="Select duration" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="150">2.5 Minutes</SelectItem>
        <SelectItem value="120">2 Minutes</SelectItem>
        <SelectItem value="180">3 Minutes</SelectItem>
        <SelectItem value="300">5 Minutes</SelectItem>
        <SelectItem value="600">10 Minutes</SelectItem>
        <SelectItem value="900">15 Minutes</SelectItem>
        <SelectItem value="1800">30 Minutes</SelectItem>
        <SelectItem value="3600">1 Hour</SelectItem>
        <SelectItem value="14400">4 Hours</SelectItem>
        <SelectItem value="36000">10 Hours</SelectItem>
        <SelectItem value="86400">24 Hours</SelectItem>
        <SelectItem value="172800">48 Hours</SelectItem>
      </SelectContent>
    </Select>
  );
}
