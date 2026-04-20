import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface Lecturer {
  uid: string;
  fullName: string;
  email: string;
  department?: string;
  status: 'active' | 'revoked';
  invitedAt: Date;
}

interface LecturerTableProps {
  lecturers: Lecturer[];
  onRevoke: (lecturer: Lecturer) => void;
}

export const LecturerTable: React.FC<LecturerTableProps> = ({ lecturers, onRevoke }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--color-border)]">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Staff Member
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Department
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Joined
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[var(--color-border)]">
          {lecturers.map((lecturer) => (
            <tr key={lecturer.uid} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded-full flex items-center justify-center font-bold font-serif text-sm">
                    {lecturer.fullName.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{lecturer.fullName}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{lecturer.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[var(--color-text-primary)]">{lecturer.department || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {lecturer.status === 'active' ? (
                  <Badge variant="active">Active</Badge>
                ) : (
                  <Badge variant="revoked">Revoked</Badge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                {lecturer.invitedAt.toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button 
                  variant={lecturer.status === 'active' ? 'danger' : 'secondary'}
                  className="!px-3 !py-1 text-xs"
                  onClick={() => onRevoke(lecturer)}
                >
                  {lecturer.status === 'active' ? 'Revoke Access' : 'Restore Access'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {lecturers.length === 0 && (
        <div className="text-center py-10 text-[var(--color-text-secondary)]">
          No staff members found.
        </div>
      )}
    </div>
  );
};
