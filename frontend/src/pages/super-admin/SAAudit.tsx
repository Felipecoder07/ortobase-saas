import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import saApi from '../../utils/superAdminApi';
import { ShieldCheck, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  details: string | null;
  userEmail?: string | null;
  createdAt: string;
}

const ITEMS_PER_PAGE = 15;

const SAAudit: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialFilter = query.get('filter') || 'ALL';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await saApi.get(`/audit?filter=${actionFilter}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
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
          <h2>Logs de Auditoria</h2>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>Filtrar por Ação:</span>
          <select className="form-control" style={{ width: '250px' }} value={actionFilter} onChange={e => { setActionFilter(e.target.value); setCurrentPage(1); }}>
            <option value="ALL">Todas as Ações</option>
            <option value="LOGIN">Acessos (Logins)</option>
            <option value="TENANT">Gerenciamento de Clínicas</option>
            <option value="IMPERSONATE">Impersonation (Entrar como)</option>
          </select>
        </div>
      </div>

      <div className="card table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando logs...</div>
        ) : (
          <>
            <table className="data-table sa-table">
              <thead>
                <tr>
                  <th>Ação Realizada</th>
                  <th>Usuário (Autor)</th>
                  <th>Detalhes Adicionais</th>
                  <th>Data e Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={16} color="var(--primary)" />
                        {log.action}
                      </div>
                    </td>
                    <td>{log.userEmail || 'Sistema'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.details || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <Calendar size={14} />
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum log encontrado para este filtro.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-outline" 
                    disabled={currentPage === 1} 
                    onClick={() => handlePageChange(currentPage - 1)}
                    style={{ padding: '6px 12px' }}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <button 
                    className="btn btn-outline" 
                    disabled={currentPage === totalPages} 
                    onClick={() => handlePageChange(currentPage + 1)}
                    style={{ padding: '6px 12px' }}
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SAAudit;
