"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function ProdusentData({ params }) {
  const { id } = params;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leveranserRes, kriterierRes, tilleggRes] = await Promise.all([
          fetch(`/api/leveranser?produsent_id=${id}`),
          fetch(`/api/produsent_kriterier?produsent_id=${id}`),
          fetch(`/api/baerekraftstillegg?produsent_id=${id}`),
        ]);

        const leveranser = await leveranserRes.json();
        const kriterier = await kriterierRes.json();
        const tillegg = await tilleggRes.json();

        setData({ leveranser, kriterier, tillegg });
      } catch (err) {
        setError("Feil under henting av data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Laster data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const renderTable = (title, dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p>Ingen data tilgjengelig.</p>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              {Object.keys(dataArray[0]).map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataArray.map((item, index) => (
              <TableRow key={index}>
                {Object.values(item).map((value, valueIndex) => (
                  <TableCell key={valueIndex}>{value}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Data for produsent {id}</CardTitle>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-6">
            {renderTable("Leveranser", data.leveranser)}
            {renderTable("Kriterier", data.kriterier)}
            {renderTable("Bærekraftstillegg", data.tillegg)}
          </div>
        ) : (
          <p>Ingen data tilgjengelig.</p>
        )}
      </CardContent>
    </Card>
  );
}
