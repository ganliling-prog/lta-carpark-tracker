import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Copy, Check, Server, Terminal, Play, RotateCcw } from 'lucide-react';
import { BackendConfig } from '../types/carpark';

interface BackendIntegrationModalProps {
  config: BackendConfig;
  setConfig: React.Dispatch<React.SetStateAction<BackendConfig>>;
  onClose: () => void;
  onTestConnection: (url: string) => Promise<{ success: boolean; message: string; count?: number }>;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  config,
  setConfig,
  onClose,
  onTestConnection,
}) => {
  const [testUrl, setTestUrl] = useState<string>(config.apiUrl || 'http://localhost:3000/api/carparks');
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'express' | 'python' | 'lta'>('express');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection(testUrl);
      setTestResult(res);
      if (res.success) {
        setConfig((prev) => ({
          ...prev,
          mode: 'custom_api',
          apiUrl: testUrl,
        }));
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error: could not connect to endpoint.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleResetToMock = () => {
    setConfig((prev) => ({
      ...prev,
      mode: 'mock',
      apiUrl: '',
    }));
    setTestResult(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const expressCodeSample = `// server.ts or routes/carparks.ts (Node.js / Express)
import express from 'express';
import axios from 'axios';

const app = express();
const LTA_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';
const LTA_ACCOUNT_KEY = process.env.LTA_DATAMALL_KEY; // Your DataMall API key

app.get('/api/carparks', async (req, res) => {
  try {
    const response = await axios.get(LTA_API_URL, {
      headers: {
        'AccountKey': LTA_ACCOUNT_KEY,
        'accept': 'application/json',
      },
    });

    // ParkSG frontend natively supports LTA DataMall JSON:
    // { value: [{ CarParkID, Area, Development, Location, AvailableLots, LotType, Agency }] }
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching LTA carpark availability:', error);
    res.status(500).json({ error: 'Failed to fetch carpark data' });
  }
});

app.listen(3000, () => console.log('Carpark backend live on port 3000'));`;

  const pythonFastApiSample = `# main.py (Python FastAPI)
from fastapi import FastAPI, HTTPException
import httpx
import os

app = FastAPI(title="Singapore Carpark Service")
LTA_KEY = os.getenv("LTA_DATAMALL_KEY", "")

@app.get("/api/carparks")
async def get_carparks():
    url = "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2"
    headers = {"AccountKey": LTA_KEY, "accept": "application/json"}
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Upstream LTA error")
        return resp.json()`;

  const ltaDirectInstructions = `# Connecting Directly to Official Singapore LTA DataMall
1. Register free account at: https://datamall.lta.gov.sg/
2. Request API Key for "Car Park Availability" dataset.
3. Upstream endpoint:
   GET https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
   Headers:
     AccountKey: <YOUR_LTA_KEY>
     accept: application/json

4. Return payload directly to the frontend or configure in .env:
   VITE_CARPARK_API_URL="http://localhost:3000/api/carparks"`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Backend Connection & API Setup</h2>
              <p className="text-xs text-slate-500">
                Plug your backend service or LTA DataMall proxy into ParkSG frontend
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Data Mode Banner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Current Source:
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    config.mode === 'custom_api'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {config.mode === 'custom_api' ? 'Connected Backend API' : 'Simulated Real-Time Sandbox'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {config.mode === 'custom_api'
                  ? `Active endpoint: ${config.apiUrl}`
                  : 'Currently generating dynamic lot availability matching Singapore carparks.'}
              </p>
            </div>

            {config.mode === 'custom_api' && (
              <button
                onClick={handleResetToMock}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Switch to Sandbox</span>
              </button>
            )}
          </div>

          {/* Test & Configure Endpoint */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Connect Your Backend Endpoint</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="http://localhost:3000/api/carparks or https://api.yoursite.com/carparks"
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
              <button
                onClick={handleTest}
                disabled={testing || !testUrl.trim()}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
              >
                {testing ? (
                  <>Connecting...</>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Test & Save</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{testResult.message}</div>
                  {testResult.count !== undefined && (
                    <div className="text-[11px] mt-0.5 font-mono">
                      Successfully loaded {testResult.count} carparks into ParkSG frontend.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Code Samples for Backend Implementation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Backend Implementation Examples</h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
                <button
                  onClick={() => setActiveCodeTab('express')}
                  className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
                    activeCodeTab === 'express' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Node.js / Express
                </button>
                <button
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
                    activeCodeTab === 'python' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Python FastAPI
                </button>
                <button
                  onClick={() => setActiveCodeTab('lta')}
                  className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
                    activeCodeTab === 'lta' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  LTA DataMall Guide
                </button>
              </div>
            </div>

            <div className="relative bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800">
              <button
                onClick={() =>
                  copyToClipboard(
                    activeCodeTab === 'express'
                      ? expressCodeSample
                      : activeCodeTab === 'python'
                      ? pythonFastApiSample
                      : ltaDirectInstructions
                  )
                }
                className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[11px] transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <pre className="pt-2 text-slate-300 leading-relaxed">
                {activeCodeTab === 'express'
                  ? expressCodeSample
                  : activeCodeTab === 'python'
                  ? pythonFastApiSample
                  : ltaDirectInstructions}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
