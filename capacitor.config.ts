import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.listapassageiros.app',
  appName: 'Lista de Passageiros',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
