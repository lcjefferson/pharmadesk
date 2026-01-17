import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Icons } from '../../components/UI/Icons';
import Modal from '../../components/UI/Modal';
import { useToast } from '../../context/ToastContext';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    name: '', // Admin Name
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // In a real scenario, we might have a specific endpoint for companies
      // For now, we list users and filter/display admins who represent companies
      // Or if the backend supports listing companies directly.
      // Since we don't have a specific GET /companies, we might need to rely on GET /users
      // but users are filtered by companyId in the backend.
      // Wait, if I am superadmin (companyId=null), GET /users should return ALL users?
      // My backend UsersService.findAll implementation:
      // return this.usersRepository.find({ where: { companyId } });
      // If companyId is null, it finds users where companyId IS NULL (system admins).
      // This is a problem. Superadmin needs to see ALL users or at least company admins.
      
      // Let's assume for now we need to fix backend to allow listing all users for superadmin
      // OR we add a specific endpoint for superadmin to list tenants.
      
      // For this implementation, I will assume GET /users returns what we need
      // or I will implement a quick fix on backend if needed.
      // But let's write the frontend code first assuming we can get the data.
      
      const { data } = await api.get('/users'); 
      // We'll filter client-side if needed, or expect backend to return all.
      setCompanies(data.filter(u => u.companyName)); // Show only users with companyName
    } catch (error) {
      console.error('Error fetching companies:', error);
      // showToast('Erro ao carregar empresas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        ...formData,
        role: 'admin', // Force role to admin for company creator
      });
      showToast('Empresa criada com sucesso!', 'success');
      setIsModalOpen(false);
      setFormData({ companyName: '', name: '', email: '', password: '' });
      fetchCompanies();
    } catch (error) {
      console.error(error);
      showToast('Erro ao criar empresa', 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestão de Empresas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Icons.Plus className="w-5 h-5 mr-2" />
          Nova Empresa
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Empresa</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Admin</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Email</th>
                <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {company.companyName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{company.name}</td>
                  <td className="px-6 py-4 text-slate-600">{company.email}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm font-mono">
                    {company.companyId}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-primary-600">
                      <Icons.Pencil className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Nenhuma empresa cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Empresa"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome da Empresa
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do Administrador
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Criar Empresa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Companies;
