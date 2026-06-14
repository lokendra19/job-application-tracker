export const STATUS_COLORS = {
  'Wishlist': { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-500/30', dot: 'bg-purple-500' },
  'Applied': { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-500/30', dot: 'bg-blue-500' },
  'Assessment': { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-500/30', dot: 'bg-yellow-500' },
  'Interview': { bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-500/30', dot: 'bg-indigo-500' },
  'HR Round': { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-500/30', dot: 'bg-cyan-500' },
  'Offer': { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-500/30', dot: 'bg-green-500' },
  'Rejected': { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-500/30', dot: 'bg-red-500' },
};

export const STATUSES = ['Wishlist', 'Applied', 'Assessment', 'Interview', 'HR Round', 'Offer', 'Rejected'];
export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

export function getStatusClass(status) {
  const colors = STATUS_COLORS[status];
  if (!colors) return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
  return `${colors.bg} ${colors.text}`;
}
