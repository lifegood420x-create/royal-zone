import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from './components/auth-provider';
import { Layout } from './components/layout';
import { AdminLayout } from './components/admin-layout';

// User Pages
import Home from './pages/home';
import Earn from './pages/earn';
import Refer from './pages/refer';
import Withdraw from './pages/withdraw';
import Profile from './pages/profile';
import Rules from './pages/rules';

// Admin Pages
import AdminDashboard from './pages/admin/dashboard';
import AdminPayouts from './pages/admin/payouts';
import AdminUsers from './pages/admin/users';
import AdminTasks from './pages/admin/tasks';
import AdminConfig from './pages/admin/config';

const queryClient = new QueryClient();

function UserRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/earn" component={Earn} />
        <Route path="/refer" component={Refer} />
        <Route path="/withdraw" component={Withdraw} />
        <Route path="/profile" component={Profile} />
        <Route path="/rules" component={Rules} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AdminRouter() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/" component={AdminDashboard} />
        <Route path="/payouts" component={AdminPayouts} />
        <Route path="/users" component={AdminUsers} />
        <Route path="/tasks" component={AdminTasks} />
        <Route path="/config" component={AdminConfig} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin" nest>
        <AdminRouter />
      </Route>
      <Route path="/" nest>
        <UserRouter />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
