import { Vimeo } from '@vimeo/vimeo';

// Inicializa o cliente Vimeo com as credenciais do .env
const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID!,
  process.env.VIMEO_CLIENT_SECRET!,
  process.env.VIMEO_ACCESS_TOKEN!
);

// Wrapper para métodos do Vimeo que vamos usar
export const vimeoClient = {
  // Obter detalhes de um vídeo
  getVideo: async (videoId: string) => {
    return new Promise((resolve, reject) => {
      client.request({
        method: 'GET',
        path: `/videos/${videoId}`,
      }, (error, body) => {
        if (error) {
          reject(error);
        }
        resolve(body);
      });
    });
  },

  // Obter o progresso de um vídeo (requer implementação do player no frontend)
  updateProgress: async (videoId: string, progress: number) => {
    // Aqui implementaremos a lógica de tracking do progresso
    // Isso será chamado pelos eventos do player no frontend
  },
};

// Tipos para o progresso do vídeo
export interface VideoProgress {
  videoId: string;
  progress: number;
  position: number;
  completed: boolean;
}
