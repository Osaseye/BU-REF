import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface StudentRowProps {
  student: {
    matricNo: string;
    fullName: string;
    department: string;
    cgpa: number;
    level: string;
    profileComplete: boolean;
  };
}

export const StudentRow: React.FC<StudentRowProps> = ({ student }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-[var(--color-border)] last:border-b-0">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 bg-[var(--color-primary-muted)] text-[var(--color-primary)] rounded-full flex items-center justify-center font-bold font-serif text-sm">
            {student.fullName.charAt(0)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-[var(--color-text-primary)]">{student.fullName}</div>
            <div className="text-sm text-[var(--color-text-secondary)]">{student.matricNo}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-[var(--color-text-primary)]">{student.department}</div>
        <div className="text-xs text-[var(--color-text-secondary)]">{student.level}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
        {student.cgpa.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {student.profileComplete ? (
          <Badge variant="active">Complete</Badge>
        ) : (
          <Badge variant="default">Incomplete</Badge>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link 
          to={`/lecturer/student/${encodeURIComponent(student.matricNo)}`} 
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center justify-end gap-1"
        >
          View <ChevronRight className="w-4 h-4" />
        </Link>
      </td>
    </tr>
  );
};
