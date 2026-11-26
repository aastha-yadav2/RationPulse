import React from 'react';
import {
  AlertSeverity,
  RecommendationStatus,
  RiskLevel,
} from '../types';

export const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const styles: Record<RiskLevel, string> = {
    Low: 'bg-[#E6F4EA] text-[#1E6B3A] border-[#B7DFC5]',
    Medium: 'bg-[#FEF7E0] text-[#9A6700] border-[#F5DFA6]',
    High: 'bg-[#FDECE2] text-[#B44312] border-[#F6C8AE]',
    Critical: 'bg-[#FDE8E8] text-[#B42318] border-[#F5B7B7]',
  };

  const dots: Record<RiskLevel, string> = {
    Low: 'bg-[#2D6A4F]',
    Medium: 'bg-[#D97706]',
    High: 'bg-[#EA580C]',
    Critical: 'bg-[#DC2626]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[level]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[level]}`} />
      {level}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: AlertSeverity }> = ({
  severity,
}) => {
  const styles: Record<AlertSeverity, string> = {
    Critical: 'bg-[#FDE8E8] text-[#B42318] border-[#F5B7B7]',
    High: 'bg-[#FDECE2] text-[#B44312] border-[#F6C8AE]',
    Medium: 'bg-[#FEF7E0] text-[#9A6700] border-[#F5DFA6]',
    Info: 'bg-[#E9EFEA] text-[#354F52] border-[#C9D8CC]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[severity]}`}
    >
      {severity}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: RecommendationStatus }> = ({
  status,
}) => {
  const styles: Record<RecommendationStatus, string> = {
    'Pending Approval': 'bg-[#FEF7E0] text-[#9A6700] border-[#F5DFA6]',
    Approved: 'bg-[#E6F4EA] text-[#1E6B3A] border-[#B7DFC5]',
    Rejected: 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export const DemoDataBadge: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-[#E9EFEA] text-[#2D6A4F] border border-[#C9D8CC] ${className}`}
  >
    DEMO DATA
  </span>
);
