import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { fmtDate } from '../../utils.js';

export default function UsersManager() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.get('/users').then((r) => setUsers(r.data.users));
  }, []);

  const changeRole = async (u, role) => {
    try {
      const r = await api.put(`/users/${u._id}/role`, { role });
      setUsers((list) => list.map((x) => (x._id === u._id ? r.data.user : x)));
      toast.success(r.data.message);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}'s account?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      setUsers((list) => list.filter((x) => x._id !== u._id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  if (!users) return <div className="empty"><div className="spinner" /></div>;

  return (
    <>
      <div className="section-head"><h3>Users ({users.length})</h3></div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}{u._id === me._id && <small>(you)</small>}</td>
                <td>{u.email}</td>
                <td>{fmtDate(u.createdAt)}</td>
                <td>
                  <select
                    className="status-select"
                    value={u.role}
                    disabled={u._id === me._id}
                    onChange={(e) => changeRole(u, e.target.value)}
                  >
                    <option value="customer">customer</option>
                    <option value="vendor">vendor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="actions">
                  <button className="btn btn-danger btn-sm" disabled={u._id === me._id} onClick={() => remove(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
