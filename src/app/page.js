"use client";

import Link from "next/link"; // Importer Link fra Next.js for navigasjon
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState(null);

  const fetchData = async (apiEndpoint) => {
    setLoading(true);
    setError(null);
    setActiveEndpoint(apiEndpoint);

    try {
      const res = await fetch(apiEndpoint);
      if (!res.ok) throw new Error("Nettverksrespons var ikke ok");
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError("Feil under henting av data: " + err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const endpoints = [
    { name: "Produsenter", endpoint: "/api/produsenter" },
    { name: "Leveranser", endpoint: "/api/leveranser" },
    { name: "Kriterier", endpoint: "/api/kriterier" },
    { name: "Oppfylte kriterier", endpoint: "/api/produsent_kriterier" },
    { name: "Bærekraftstillegg", endpoint: "/api/baerekraftstillegg" },
  ];

  const renderTable = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <p>Ingen data å vise</p>;
    }

    const headers = Object.keys(data[0]);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {headers.map((header) => {
                const cellData = row[header];

                // Sjekk om kolonnen er 'id' for å rendre Link for produsenten
                if (header === "id") {
                  return (
                    <TableCell key={header}>
                      <Link
                        href={`/produsenter/${cellData}`}
                        className="text-blue-500 underline"
                      >
                        {cellData}
                      </Link>
                    </TableCell>
                  );
                }

                // Sjekk om cellData er en array (som 'result'), og rendrer hver verdi
                if (Array.isArray(cellData)) {
                  return (
                    <TableCell key={header}>
                      {cellData.map((resultItem, resultIndex) => (
                        <div key={resultIndex}>
                          <strong>Måned:</strong> {resultItem.month} <br />
                          <strong>Oppfylte kriterier:</strong>{" "}
                          {resultItem.oppfylteKriterier} <br />
                          <strong>Tillegg per liter:</strong>{" "}
                          {resultItem.tilleggPerLiter} øre <br />
                          <strong>Total tillegg:</strong>{" "}
                          {resultItem.totalTillegg} kr <br />
                          <hr />
                        </div>
                      ))}
                    </TableCell>
                  );
                }

                // Hvis cellen inneholder et objekt, itererer vi over nøkkel-verdi-parene
                if (typeof cellData === "object" && cellData !== null) {
                  return (
                    <TableCell key={header}>
                      <ul>
                        {Object.entries(cellData).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                  );
                }

                // Hvis cellData ikke er et objekt eller en array, rendrer vi verdien direkte
                return <TableCell key={header}>{String(cellData)}</TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Hent data fra ulike tabeller</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {endpoints.map(({ name, endpoint }) => (
          <Button
            key={endpoint}
            onClick={() => fetchData(endpoint)}
            variant={activeEndpoint === endpoint ? "default" : "outline"}
            className="w-full"
          >
            {name}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resultat</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Laster data...
            </div>
          )}

          {error && <div className="text-red-500 p-4">{error}</div>}

          {data && <div className="overflow-x-auto">{renderTable(data)}</div>}

          {!loading && !error && !data && (
            <div className="text-muted-foreground p-4">
              Velg en knapp ovenfor for å hente data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
