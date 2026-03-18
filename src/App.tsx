/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AlbionLayout from './components/AlbionLayout';
import BlufoxLayout from './components/BlufoxLayout';
import LevaporeCalculator from './components/Calculators/LevaporeCalculator';
import DosingPumpCalculator from './components/Calculators/DosingPumpCalculator';
import MbbrCalculator from './components/Calculators/MbbrCalculator';
import MbrCalculator from './components/Calculators/MbrCalculator';
import PressureCalculator from './components/Calculators/PressureCalculator';
import CebCipCalculator from './components/Calculators/CebCipCalculator';
import AfmCalculator from './components/Calculators/AfmCalculator';
import Login from './components/Auth/Login';
import ProjectionCalculator from './components/CalculatorsBlufox/ProjectionCalculator.tsx';
import BiologicalCalculator from './components/CalculatorsBlufox/BiologicalCalculator.tsx';
import SumitomoCalculator from './components//CalculatorsBlufox/SumitomoCalculator.tsx';
import SkidMaterialCalculator from './components/CalculatorsBlufox/SkidCalculator.tsx';
import ProposalGenerator from './components/CalculatorsBlufox/Proposal/ProposalGenerator.tsx';
import Layout3D from './components/Layout3D/Layout3D';
import Mbr3DLayout from './components/Layout3D/Mbr3DLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const hasToken = document.cookie.includes('token=');
  if (!hasToken) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/albion" replace />
            </ProtectedRoute>
          } />

          {/* Albion Flow */}
          <Route path="/albion" element={
            <ProtectedRoute>
              <AlbionLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="levapore" replace />} />
            <Route path="levapore" element={<LevaporeCalculator />} />
            <Route path="dosing" element={<DosingPumpCalculator />} />
            <Route path="cebcip" element={<CebCipCalculator />} />
            <Route path="mbbr" element={<MbbrCalculator />} />
            <Route path="mbr" element={<MbrCalculator />} />
            <Route path="pressure" element={<PressureCalculator />} />
            <Route path="afm" element={<AfmCalculator />} />
          </Route>

          {/* Blufox Flow */}
          <Route path="/blufox" element={
            <ProtectedRoute>
              <BlufoxLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="projection" replace />} />
            <Route path="projection" element={<ProjectionCalculator />} />
            <Route path="biological" element={<BiologicalCalculator />} />
            <Route path="sumitomo" element={<SumitomoCalculator />} />
            <Route path="skid" element={<SkidMaterialCalculator/>} />
            <Route path="proposal" element={<ProposalGenerator />} />
         </Route>
         {/* 3D Layout Flow */}
          <Route path="/layout3d" element={
            <ProtectedRoute>
              <Layout3D />
            </ProtectedRoute>
          }>
            <Route index element={<Mbr3DLayout />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
