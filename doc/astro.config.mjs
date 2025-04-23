// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'My Docs',
			social: {
				github: 'https://github.com/withastro/starlight',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Inicio', link: 'guides/inicio' },
						{ label: 'Diagrama Casos de Uso', link: 'guides/casos-de-uso' },
						{ label: 'Diagrama de Clases', link: 'guides/clases' },
						{ label: 'Diagrama Entidad-Relación', link: 'guides/entidad-relacion' },
						{ label: 'Diagrama de Componentes', link: 'guides/componentes' },
						{ label: 'Diagrama de Actividades', link: 'guides/actividades' },
						{ label: 'Diagrama de Secuencia', link: 'guides/secuencia' },
						{ label: 'Diagrama de Despliegue', link: 'guides/despliegue' },
						{ label: 'Casos de Prueba', link: 'guides/prueba' },
					],

					
				},
			],
		}),
	],
});
