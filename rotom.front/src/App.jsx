import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PokedexPage from "./pages/PokedexPage";
import CharacterPage from "./pages/CharacterPage";
import ItemPage from "./pages/ItemPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ForumPage from "./pages/ForumPage";
import ForumDetailPage from "./pages/ForumDetailPage";
import BattlesPage from "./pages/BattlesPage";
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
import { useUser } from "./hooks/useUser";

export default function App() {
  const { user } = useUser();

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pokedex" element={<PokedexPage />} />
        <Route path="/pokedex/:sp_id" element={<PokemonDetailPage />} />
        <Route path="/items" element={<ItemPage />} />
        <Route path="/items/:item_id" element={<ItemDetailPage />} />
        <Route path="/characters" element={<CharacterPage />} />
        <Route path="/characters/:character_id" element={<CharacterDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {user && (
          <>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/forums" element={<ForumPage />} />
            <Route path="/forums/:forum_id" element={<ForumDetailPage />} />
            <Route path="/battles" element={<BattlesPage />} />
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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
