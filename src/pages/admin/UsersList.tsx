import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, ShieldAlert, User, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role?: 'admin' | 'user';
}

const UsersList = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const isSearching = searchQuery.trim().length > 0;

      let profilesData: any[] = [];
      let count = 0;

      if (isSearching) {
        // --- CENÁRIO DE BUSCA: Busca por e-mail ou nome em toda a tabela de perfis ---
        const { data: profiles, error: profilesError, count: searchCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .ilike('email', `%${searchQuery}%`)
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        if (profilesError) throw profilesError;
        profilesData = profiles || [];
        count = searchCount || 0;
      } else {
        // --- CENÁRIO PADRÃO: Buscar apenas quem é Admin ---
        // Primeiro, descobrimos os IDs que estão na tabela 'user_roles' como 'admin'
        const { data: adminRoles, error: rolesCountError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (rolesCountError) throw rolesCountError;
        
        const adminIds = adminRoles?.map(r => r.user_id) || [];

        if (adminIds.length === 0) {
          setUsers([]);
          setTotalCount(0);
          return;
        }

        // Agora buscamos os perfis que pertencem a esses IDs de administradores
        const { data: profiles, error: profilesError, count: adminCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .in('id', adminIds)
          .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

        if (profilesError) throw profilesError;
        profilesData = profiles || [];
        count = adminCount || 0;
      }

      setTotalCount(count);

      if (profilesData.length === 0) {
        setUsers([]);
        return;
      }

      // Busca as roles correspondentes para os perfis renderizados na página atual
      const userIds = profilesData.map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Mapeia os perfis acoplando a role (se não achar na tabela, assume 'user')
      const usersWithRoles = profilesData.map((profile) => ({
        ...profile,
        role: roles?.find((r) => r.user_id === profile.id)?.role as 'admin' | 'user' || 'user',
      }));

      setUsers(usersWithRoles);
    } catch (error: unknown) {  
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Recarrega os dados quando muda de página ou quando a pesquisa muda
  useEffect(() => {
    // Reseta para a primeira página ao iniciar uma nova busca externa
    fetchUsers();
  }, [currentPage, searchQuery]);

  const toggleAdmin = async (userId: string, currentRole: string | undefined) => {
    try {
      setProcessingId(userId);
      const newRole = currentRole === 'admin' ? 'user' : 'admin';

      if (currentRole === 'admin') {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;
      }

      toast.success(`Usuário ${newRole === 'admin' ? 'promovido a' : 'removido de'} administrador`);
      fetchUsers();
    } catch (error: unknown) {
      console.error('Error toggling admin role:', error);
      toast.error('Erro ao alterar permissão');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as permissões de acesso ao painel administrativo
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Mostrando administradores cadastrados. Use a busca por e-mail para encontrar usuários comuns.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário comum por e-mail..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Sempre reseta a página ao pesquisar
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name || ''} className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <span>{user.full_name || 'Sem nome'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === 'admin' ? (
                            <Badge className="bg-primary/20 text-primary border-primary/20 flex w-fit gap-1 items-center">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground flex w-fit gap-1 items-center">
                              Usuário
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={user.role === 'admin' ? "outline" : "default"}
                            size="sm"
                            className="gap-2"
                            onClick={() => toggleAdmin(user.id, user.role)}
                            disabled={processingId === user.id}
                          >
                            {processingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.role === 'admin' ? (
                              <>
                                <ShieldAlert className="h-4 w-4" />
                                Remover Admin
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4" />
                                Tornar Admin
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Paginação */}
          {!loading && totalCount > pageSize && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, totalCount)} de {totalCount} registros
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * pageSize >= totalCount}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersList;