import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Loader2, AlertTriangle, CheckCircle, Info, Banknote, Percent, TrendingDown, TrendingUp, Users, ShieldAlert, LayoutDashboard, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data (Replace with actual data fetching)
const mockIndustryData = {
    marketGrowthVolatility: [
        { label: "Low Volatility", score: 1, description: "Companies focused on stable game genres." },
        { label: "Medium Volatility", score: 2, description: "Companies with some exposure to volatile genres." },
        { label: "High Volatility", score: 3, description: "Companies heavily invested in unproven concepts." },
    ],
    regulatoryRisk: [
        { label: "Low Risk", score: 1, description: "Operations in stable regulatory environments." },
        { label: "Medium Risk", score: 2, description: "Operations in evolving regulatory landscapes." },
        { label: "High Risk", score: 3, description: "Operations in regions with high regulatory uncertainty." },
    ],
    platformDependence: [
        { label: "Low Dependence", score: 1, description: "Diversified distribution channels." },
        { label: "Medium Dependence", score: 2, description: "Reliance on major app stores." },
        { label: "High Dependence", score: 3, description: "Exclusive reliance on a single platform." },
    ],
    financialStability: [
        { label: "Low Debt", score: 1, description: "Debt-to-equity ratio < 0.75" },
        { label: "Medium Debt", score: 2, description: "Debt-to-equity ratio 0.75 - 1.5" },
        { label: "High Debt", score: 3, description: "Debt-to-equity ratio > 1.5" },
    ],
    managementStability: [
        { label: "High Experience", score: 1, description: "Avg. management tenure > 8 years" },
        { label: "Medium Experience", score: 2, description: "Avg. management tenure 4-8 years" },
        { label: "Low Experience", score: 3, description: "Avg. management tenure < 4 years" },
    ],
};

interface CohortData {
    id: string;
    name: string;
    revenue: number;
    cac: number;
    retentionRate: number;
    companyId: string;
}

interface CompanyData {
    id: string;
    name: string;
    debtToEquityRatio: number;
    revenue: number;
}

const mockCohortData: CohortData[] = [
    { id: "cohort-1", name: "Cohort A", revenue: 150000, cac: 50000, retentionRate: 0.85, companyId: "company-1" },
    { id: "cohort-2", name: "Cohort B", revenue: 120000, cac: 40000, retentionRate: 0.78, companyId: "company-1" },
    { id: "cohort-3", name: "Cohort C", revenue: 200000, cac: 60000, retentionRate: 0.92, companyId: "company-2" },
    { id: "cohort-4", name: "Cohort D", revenue: 180000, cac: 55000, retentionRate: 0.88, companyId: "company-2" },
    { id: "cohort-5", name: "Cohort E", revenue: 250000, cac: 70000, retentionRate: 0.95, companyId: "company-3" },
];

const mockCompanyData: CompanyData[] = [
    { id: "company-1", name: "GameCo X", debtToEquityRatio: 1.2, revenue: 5000000 },
    { id: "company-2", name: "GameCo Y", debtToEquityRatio: 0.5, revenue: 8000000 },
    { id: "company-3", name: "Indie Games Inc", debtToEquityRatio: 2.0, revenue: 2000000 },
];

const GamingCreditRiskModel = () => {
    const [cohorts, setCohorts] = useState<CohortData[]>(mockCohortData);
    const [companies, setCompanies] = useState<CompanyData[]>(mockCompanyData);
    const [loading, setLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [marketGrowthVolatility, setMarketGrowthVolatility] = useState<number>(1);
    const [regulatoryRisk, setRegulatoryRisk] = useState<number>(1);
    const [platformDependence, setPlatformDependence] = useState<number>(1);
    const [financialStability, setFinancialStability] = useState<number>(1);
    const [managementStability, setManagementStability] = useState<number>(1);
    const [results, setResults] = useState<{
        cohortId: string;
        adjustedScore: number;
        companyName: string;
        pd: number;  // Added PD
        lgd: number; // Added LGD
    }[]>([]);
    const [error, setError] = useState<string | null>(null);

    const calculateRisk = () => {
        setLoading(true);
        setError(null);
        try {
            if (!selectedCompany) {
                setError("Please select a company.");
                setLoading(false);
                return;
            }

            const selectedCompanyData = companies.find(c => c.id === selectedCompany);
            if (!selectedCompanyData) {
                setError("Company not found.");
                setLoading(false);
                return;
            }

            const companyExternalRiskIndex =
                marketGrowthVolatility +
                regulatoryRisk +
                platformDependence +
                financialStability +
                managementStability;

            const calculatedResults = cohorts
                .filter(cohort => cohort.companyId === selectedCompany)
                .map(cohort => {
                    const adjustedScore = cohort.revenue / cohort.cac * (1 + (companyExternalRiskIndex - 5) * 0.075); // Simplified for demo

                    // Very simplified PD and LGD for demonstration.  These need proper models.
                    const pd = 1 / (1 + Math.exp(-0.1 * adjustedScore)); // Logistic function for PD
                    const lgd = 0.8 - (0.5 * (1 / (1 + Math.exp(-0.05 * adjustedScore))));  // LGD, inversely related to score

                    return {
                        cohortId: cohort.id,
                        adjustedScore,
                        companyName: selectedCompanyData.name,
                        pd,
                        lgd,
                    };
                });
            setResults(calculatedResults);
            setLoading(false);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
            setLoading(false);

        }
    };

    // Placeholder for Google Cloud integration (replace with actual code)
    useEffect(() => {
        // In a real application, this is where you would:
        // 1. Authenticate with Google Cloud.
        // 2. Fetch data from Firestore or another database.
        // 3. Call a Cloud Function to perform complex calculations.
        // 4. Store results in Firestore.
        // For this example, we're using mock data.

        // Example of fetching data (replace with actual Google Cloud calls)
        const fetchData = async () => {
            // Simulate fetching data from a database
            // In a real app, use:
            // const snapshot = await firestore.collection('companies').get();
            // const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // setCompanies(companies);

            //Simulate fetching data from a database
            // const snapshot = await firestore.collection('cohorts').get();
            // const cohorts = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            // setCohorts(cohorts)

            // For this example, we're using mock data, so we don't need to do anything here.
        };

        fetchData();
    }, []);

    const getRiskLevel = (score: number) => {
        if (score > 150) {
            return { label: "Low Risk", color: "text-green-500", icon: <TrendingUp className="w-4 h-4 ml-1" /> };
        } else if (score > 100) {
            return { label: "Medium Risk", color: "text-yellow-500", icon: <Percent className="w-4 h-4 ml-1" /> };
        } else {
            return { label: "High Risk", color: "text-red-500", icon: <TrendingDown className="w-4 h-4 ml-1" /> };
        }
    };

    // Function to handle Google Drive export (Conceptual)
    const handleExportToDrive = async () => {
        if (!results || results.length === 0) {
            setError("No data to export.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Convert data to a suitable format (e.g., CSV, JSON)
            const csvData = convertToCSV(results);  // Implement this
            //const jsonData = JSON.stringify(results);

            // 2.  Send data to a server endpoint (Cloud Function)
            const response = await fetch('/api/exportToDrive', { //  Create a serverless function
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename: 'credit_risk_data.csv', data: csvData }), // or jsonData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to export: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            if (result.success) {
                setLoading(false);
            }
            else {
                setError(result.error || "Failed to export data to Google Drive");
                setLoading(false);
            }

            // 3. Handle the response (e.g., show a success message)
            console.log('Export successful:', result);
            //  You might want to show a toast or a message here
            setLoading(false);

        } catch (error: any) {
            setError(`Error exporting data: ${error.message}`);
            setLoading(false);
        }
    };

    // Helper function to convert data to CSV format
    const convertToCSV = (data: any[]) => {
        if (!data || data.length === 0) {
            return '';
        }

        const header = Object.keys(data[0]).join(',');
        const rows = data.map(item =>
            Object.values(item)
                .map(value => typeof value === 'string' ? `"${value}"` : value) // Quote strings
                .join(',')
        );
        return `${header}\n${rows.join('\n')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        Gaming Credit Risk Model
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Assess credit risk for gaming companies and their user cohorts.
                    </p>
                </div>

                <Tabs defaultValue="model" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="model">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Model
                        </TabsTrigger>
                        <TabsTrigger value="documentation">
                            <Info className="w-4 h-4 mr-2" />
                            Documentation
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="model">
                        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-white text-lg sm:text-xl">Credit Risk Assessment</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Evaluate the risk associated with gaming companies and their cohorts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h2 className="text-md font-semibold text-gray-300 mb-3">Company Selection</h2>
                                        <Select onValueChange={setSelectedCompany} value={selectedCompany}>
                                            <SelectTrigger className="w-full bg-black/20 text-white border-purple-500/30">
                                                <SelectValue placeholder="Select a company" className="text-gray-300" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700">
                                                {companies.map((company) => (
                                                    <SelectItem key={company.id} value={company.id} className="hover:bg-purple-500/20 text-white">
                                                        {company.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <h2 className="text-md font-semibold text-gray-300 mb-3">Company Risk Factors</h2>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label htmlFor="marketGrowthVolatility" className="block text-sm font-medium text-gray-300">Market Growth Volatility</label>
                                                <Select onValueChange={(value) => setMarketGrowthVolatility(parseInt(value, 10) || 1)} value={String(marketGrowthVolatility)}>
                                                    <SelectTrigger className="w-full bg-black/20 text-white border-purple-500/30">
                                                        <SelectValue placeholder="Select Volatility" className="text-gray-300" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-700">
                                                        {mockIndustryData.marketGrowthVolatility.map((item) => (
                                                            <SelectItem key={item.score} value={item.score.toString()} className="hover:bg-purple-500/20 text-white">
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="regulatoryRisk" className="block text-sm font-medium text-gray-300">Regulatory Risk</label>
                                                <Select onValueChange={(value) => setRegulatoryRisk(parseInt(value, 10) || 1)} value={String(regulatoryRisk)}>
                                                    <SelectTrigger className="w-full bg-black/20 text-white border-purple-500/30">
                                                        <SelectValue placeholder="Select Risk" className="text-gray-300" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-700">
                                                        {mockIndustryData.regulatoryRisk.map((item) => (
                                                            <SelectItem key={item.score} value={item.score.toString()} className="hover:bg-purple-500/20 text-white">
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="platformDependence" className="block text-sm font-medium text-gray-300">Platform Dependence</label>
                                                <Select onValueChange={(value) => setPlatformDependence(parseInt(value, 10) || 1)} value={String(platformDependence)}>
                                                    <SelectTrigger className="w-full bg-black/20 text-white border-purple-500/30">
                                                        <SelectValue placeholder="Select Dependence" className="text-gray-300" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-700">
                                                        {mockIndustryData.platformDependence.map((item) => (
                                                            <SelectItem key={item.score} value={item.score.toString()} className="hover:bg-purple-500/20 text-white">
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="financialStability" className="block text-sm font-medium text-gray-300">Financial Stability</label>
                                                <Select onValueChange={(value) => setFinancialStability(parseInt(value, 10) || 1)} value={String(financialStability)}>
                                                    <SelectTrigger className="w-full bg-black/20 text-white border-purple-500/30">
                                                        <SelectValue placeholder="Select Stability" className="text-gray-300" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-700">
                                                        {mockIndustryData.financialStability.map((item) => (
                                                            <SelectItem key={item.score} value={item.score.toString()} className="hover:bg-purple-500/20 text-white">
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <label htmlFor="managementStability" className="block text-sm font-medium text-gray-300">Management Stability</label>
                                                <Select onValueChange={(value) => setManagementStability(parseInt(value, 10) || 1)} value={String(managementStability)}>
                                                    <SelectTrigger className="w-full bg-black/20 text-white border-purple-500/30">
                                                        <SelectValue placeholder="Select Stability" className="text-gray-300" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-700">
                                                        {mockIndustryData.managementStability.map((item) => (
                                                            <SelectItem key={item.score} value={item.score.toString()} className="hover:bg-purple-500/20 text-white">
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className='flex justify-between'>
                                <Button
                                    onClick={calculateRisk}
                                    disabled={loading}
                                    className={cn(
                                        " bg-gradient-to-r from-purple-500 to-blue-500 text-white",
                                        "hover:from-purple-600 hover:to-blue-600",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        "transition-all duration-300 shadow-lg hover:scale-105",
                                        "py-3 text-lg font-semibold"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Calculating...
                                        </>
                                    ) : (
                                        "Calculate Risk"
                                    )}
                                </Button>
                                <Button
                                    onClick={handleExportToDrive}
                                    disabled={loading}
                                    className={cn(
                                        " bg-green-500 text-white",
                                        "hover:bg-green-600",
                                        "disabled:opacity-50 disabled:cursor-not-allowed",
                                        "transition-all duration-300 shadow-lg hover:scale-105",
                                        "py-3 text-lg font-semibold"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <File className="mr-2 h-4 w-4 " />
                                            Export to Drive
                                        </>
                                    )}
                                </Button>
                            </CardFooter>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md flex items-center"
                                    >
                                        <AlertTriangle className="mr-2 h-5 w-5" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>

                        {results.length > 0 && (
                            <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-white text-lg sm:text-xl">Results</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Risk assessment results for selected cohorts.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table className="w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-white">Cohort ID</TableHead>
                                                <TableHead className="text-white">Company</TableHead>
                                                <TableHead className="text-white">Adjusted Score</TableHead>
                                                <TableHead className="text-white">Risk Level</TableHead>
                                                <TableHead className="text-white">PD</TableHead> {/* Added PD */}
                                                <TableHead className="text-white">LGD</TableHead> {/* Added LGD */}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.map((result) => (
                                                <TableRow key={result.cohortId}>
                                                    <TableCell className="font-medium text-gray-300">{result.cohortId}</TableCell>
                                                    <TableCell className="text-gray-300">{result.companyName}</TableCell>
                                                    <TableCell className="text-gray-300">{result.adjustedScore.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <span className={cn(
                                                            "flex items-center",
                                                            getRiskLevel(result.adjustedScore).color
                                                        )}>
                                                            {getRiskLevel(result.adjustedScore).label}
                                                            {getRiskLevel(result.adjustedScore).icon}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-gray-300">{result.pd.toFixed(4)}</TableCell> {/* Display PD */}
                                                    <TableCell className="text-gray-300">{result.lgd.toFixed(2)}</TableCell> {/* Display LGD */}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    <TabsContent value="documentation">
                        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-white text-lg sm:text-xl">Model Documentation</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Explanation of the credit risk model and its components.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-gray-300 leading-relaxed">
                                <h3 className="text-lg font-semibold text-white">Overview</h3>
                                <p>
                                    The Gaming Credit Risk Model is designed to assess the creditworthiness of gaming companies and their user cohorts. It combines cohort-level performance data with company-level risk factors to provide a comprehensive risk evaluation.
                                </p>

                                <h3 className="text-lg font-semibold text-white">Key Components</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>
                                        <span className="font-semibold">Cohort Score:</span> Initial assessment of a user cohort's performance based on metrics like revenue, CAC, and rete