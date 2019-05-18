import pkg from './package.json';

export default {
  plugins: [],
  title: 'Library name',
  public: './public',
  dest: '/docs',
  description: pkg.description,
  base: `/${pkg.name}/`,
  version: pkg.version,
  propsParser: true,
  hashRouter: true,
  typescript: true,
  htmlContext: {
    head: {
      links: [
        {
          rel: 'stylesheet',
          href: 'https://codemirror.net/theme/monokai.css',
        },
      ],
    },
  },
  themeConfig: {
    logo: {
      src: '/--libraryname--/public/logo.png',
      width: 200,
    },
    colors: {
      primary: '#000000',
    },
    codemirrorTheme: 'monokai',
  },
  menu: ['Introduction', { name: 'Components', menu: ['Intro', 'SimpleComponent', 'useHelloWorld'] }],
  docgenConfig: {
    propFilter: prop => {
      return true;
    },
  },
  filterComponents: files => {
    return files.filter(filepath => /(src)(\/.*)*\.(tsx)$/.test(filepath));
  },
};
