import React from 'react';
import { 
  Folder, 
  List, 
  Tag, 
  Briefcase, 
  User, 
  Heart, 
  Star, 
  Bookmark, 
  Sparkles, 
  CheckSquare, 
  Layers, 
  Compass,
  LucideProps
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { id: 'folder', label: 'Pasta', Icon: Folder },
  { id: 'list', label: 'Lista', Icon: List },
  { id: 'tag', label: 'Etiqueta', Icon: Tag },
  { id: 'briefcase', label: 'Trabalho', Icon: Briefcase },
  { id: 'user', label: 'Pessoal', Icon: User },
  { id: 'heart', label: 'Favorito', Icon: Heart },
  { id: 'star', label: 'Estrela', Icon: Star },
  { id: 'bookmark', label: 'Marcador', Icon: Bookmark },
  { id: 'sparkles', label: 'Metas/Especial', Icon: Sparkles },
  { id: 'check-square', label: 'Tarefas', Icon: CheckSquare },
  { id: 'layers', label: 'Projetos', Icon: Layers },
  { id: 'compass', label: 'Objetivos', Icon: Compass },
];

export const PRESET_COLORS = [
  { hex: '#3B82F6', label: 'Azul Google' },
  { hex: '#10B981', label: 'Verde Esmeralda' },
  { hex: '#8B5CF6', label: 'Roxo Violeta' },
  { hex: '#F59E0B', label: 'Âmbar Dourado' },
  { hex: '#EF4444', label: 'Vermelho Coral' },
  { hex: '#EC4899', label: 'Rosa Magenta' },
  { hex: '#06B6D4', label: 'Ciano Menta' },
  { hex: '#6366F1', label: 'Índigo Noturno' },
];

interface AreaIconProps extends LucideProps {
  name: string;
}

export const AreaIcon: React.FC<AreaIconProps> = ({ name, ...props }) => {
  const item = AVAILABLE_ICONS.find((i) => i.id === name);
  const IconComponent = item ? item.Icon : Folder;
  return <IconComponent {...props} />;
};
