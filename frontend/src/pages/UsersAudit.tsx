import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { ShieldCheck, Calendar, Filter, ChevronLeft, ChevronRight, User } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  details: string | null;
  userEmail?: string | null;
  createdAt: string;
}

const ITEMS_PER_PAGE = 20;

const UsersAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        let url = `/audit?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
        if (actionFilter) url += `&action=${actionFilter}`;
        
        const res = await api.get(url);
        setLogs(res.data.data);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [actionFilter, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="patients-page">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="section-title">
          <h2>Histórico da Clínica</h2>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>Filtrar por Ação:</span>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Ex: PATIENT, APPOINTMENT"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '250px', height: '36px' }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Ação</th>
                <th>Detalhes</th>
                <th>Usuário</th>
                <th>Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Carregando histórico...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum log encontrado.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', color: 'var(--primary)', backgroundColor: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: '12px' }}>
                        <ShieldCheck size={14} />
                        {log.action}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>{log.details || '-'}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <User size={14} color="var(--text-secondary)" />
                        {log.userEmail || 'Sistema'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '20px', borderTop: '1px solid var(--border-color)' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ padding: '6px 12px' }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Página {currentPage} de {totalPages}</span>
            <button 
              className="btn btn-outline" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 12px' }}
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersAudit;
