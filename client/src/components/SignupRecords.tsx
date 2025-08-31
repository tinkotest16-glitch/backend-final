import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SignupRecord {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  password: string;
  timestamp: string;
}

export function SignupRecords() {
  const [signups, setSignups] = useState<SignupRecord[]>([]);

  useEffect(() => {
    // Fetch signup records from localStorage
    const records = localStorage.getItem('edgemarket_signups');
    if (records) {
      setSignups(JSON.parse(records));
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Signup Records</CardTitle>
        <CardDescription>Complete signup information for all users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signups.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.fullName}</TableCell>
                  <TableCell>{record.username}</TableCell>
                  <TableCell>{record.email}</TableCell>
                  <TableCell>{record.phoneNumber}</TableCell>
                  <TableCell>{record.country}</TableCell>
                  <TableCell>{record.password}</TableCell>
                  <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
