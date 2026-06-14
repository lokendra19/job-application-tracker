import { useEffect, useState } from 'react';
import { applicationsAPI } from '../../services/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import StatusBadge from '../../components/UI/StatusBadge';
import { STATUS_COLORS, STATUSES } from '../../utils/statusColors';
import { PageLoader } from '../../components/UI/LoadingSpinner';
import { ExternalLink, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Kanban() {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);

  const buildColumns = (apps) => {
    const cols = {};
    STATUSES.forEach(s => { cols[s] = []; });
    apps.forEach(a => {
      if (cols[a.status]) cols[a.status].push(a);
    });
    return cols;
  };

  useEffect(() => {
    applicationsAPI.getAll()
      .then(({ data }) => setColumns(buildColumns(data.applications)))
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = [...columns[source.droppableId]];
    const dstCol = source.droppableId === destination.droppableId ? srcCol : [...columns[destination.droppableId]];
    const [moved] = srcCol.splice(source.index, 1);
    const updatedApp = { ...moved, status: destination.droppableId };
    dstCol.splice(destination.index, 0, updatedApp);

    setColumns(prev => ({
      ...prev,
      [source.droppableId]: srcCol,
      [destination.droppableId]: dstCol,
    }));

    try {
      await applicationsAPI.updateStatus(draggableId, destination.droppableId);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
          {STATUSES.map(status => {
            const colors = STATUS_COLORS[status];
            const cards = columns[status] || [];
            return (
              <div key={status} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors?.dot || 'bg-gray-400'}`} />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{status}</h3>
                  </div>
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-24 rounded-xl p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-500/10' : 'bg-gray-100/50 dark:bg-slate-800/50'}`}>
                      {cards.map((app, i) => (
                        <Draggable key={app.id} draggableId={app.id} index={i}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-slate-700/50 cursor-grab active:cursor-grabbing transition-shadow ${snap.isDragging ? 'shadow-xl rotate-1' : 'hover:shadow-md'}`}>
                              <div className="flex items-start gap-2 mb-2">
                                <div className="w-7 h-7 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Building2 size={14} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{app.company_name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.job_title}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">{app.job_type}</span>
                                {app.job_url && (
                                  <a href={app.job_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                    className="text-gray-400 hover:text-blue-600 transition-colors">
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
