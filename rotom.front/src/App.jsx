import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavBar from "./components/Navbar";
import PageWrapper from "./components/PageWrapper";
import MyPokemon from "./pages/MyPokemon";
import MyPokemonDetail from "./pages/MyPokemonDetail";
import HomePage from "./pages/HomePage";
import PokedexPage from "./pages/PokedexPage";
import CharacterPage from "./pages/CharacterPage";
import ItemPage from "./pages/ItemPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import ForumPage from "./pages/ForumPage";
import ForumDetailPage from "./pages/ForumDetailPage";
import BattlesPage from "./pages/BattlesPage";
import BattleArena from "./pages/BattleArena";
import RecentBattles from "./pages/RecentBattles";
import AdminDashboard from "./pages/AdminDashboard";
import AddPokemon from "./pages/AddPokemon";
import AddCharacter from "./pages/AddCharacter";
import AddItem from "./pages/AddItem";
import ManagePokemon from "./pages/ManagePokemon";
import ManageCharacter from "./pages/ManageCharacter";
import ManageItems from "./pages/ManageItems";
import UserList from "./pages/UserList";
import PokemonDetailPage from "./pages/PokemonDetailPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import CharacterDetailPage from "./pages/CharacterDetailPage";
import ShopPage from "./pages/ShopPage";
import AdminProvider from "./contexts/AdminContext";
import { SocketProvider } from "./contexts/SocketContext";
import { useUser } from "./hooks/useUser";

// Component to conditionally render navbar
function ConditionalNavBar() {
  const location = useLocation();
  const hideNavbarRoutes = ['/items/', '/pokedex/', '/character/'];
  
  // Check if current path matches any route where navbar should be hidden
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    location.pathname.includes(route) && location.pathname !== route.slice(0, -1)
  );
  
  return shouldHideNavbar ? null : <NavBar />;
}

export default function App() {
  const { user } = useUser();

  // Add loading state while user context is being determined
  if (user === undefined) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
        <p>Checking authentication status...</p>
      </div>
    );
  }

  return (
    <SocketProvider>
      <AdminProvider>
        <Router>
          <ConditionalNavBar />
          <PageWrapper>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pokedex" element={<PokedexPage />} />
            <Route path="/pokedex/:sp_id" element={<PokemonDetailPage />} />
            <Route path="/items" element={<ItemPage />} />
            <Route path="/items/:item_id" element={<ItemDetailPage />} />
            <Route path="/characters" element={<CharacterPage />} />
            <Route path="/character/:character_id" element={<CharacterDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/my-pokemon" element={<MyPokemon />} />
                          <Route path="/my-pokemon/:pokemonId" element={<MyPokemonDetail />} />

            {user && (
              <>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/user/:userId" element={<UserProfilePage />} />
                <Route path="/forums" element={<ForumPage />} />
                <Route path="/forums/:forum_id" element={<ForumDetailPage />} />
                <Route path="/battles" element={<BattlesPage />} />
                <Route path="/battles/" element={<BattlesPage />} />
                <Route path="/battle/:battleId" element={<BattleArena />} />
                <Route path="/recent-battles" element={<RecentBattles />} />
                <Route path="/shop" element={<ShopPage />} />
              </>
            )}

            {user?.is_admin && (
              <Route path="/admin" element={<AdminDashboard />}> 
                <Route path="add-pokemon" element={<AddPokemon />} />
                <Route path="add-character" element={<AddCharacter />} />
                <Route path="add-item" element={<AddItem />} />
                <Route path="manage-pokemon" element={<ManagePokemon />} />
                <Route path="manage-character" element={<ManageCharacter />} />
                <Route path="manage-item" element={<ManageItems />} />
                <Route path="users" element={<UserList />} />
              </Route>
            )}
            
            {/* Catch-all route for debugging */}
            <Route path="*" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>404 - Page Not Found</h1>
                <p>Current path: {window.location.pathname}</p>
                <p>User authenticated: {user ? 'Yes' : 'No'}</p>
                <p>User: {user ? user.username : 'Not logged in'}</p>
              </div>
            } />
            </Routes>
          </PageWrapper>
        </Router>
      </AdminProvider>
    </SocketProvider>
  );
}
