import fs from 'node:fs';
import path from 'node:path';

export default function (plop) {
  // Component generator for @inq/ui
  plop.setGenerator('component', {
    description: 'Scaffold a new standalone, tree-shakeable UI component in @inq/ui',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (e.g. Dropdown, Card, Avatar):',
        validate: (value) => {
          if (!value || value.trim() === '') {
            return 'Component name is required';
          }
          return true;
        },
      },
    ],
    actions: [
      // 1. Create component files
      {
        type: 'add',
        path: 'packages/ui/src/components/{{kebabCase name}}/{{pascalCase name}}.tsx',
        templateFile: 'generators/templates/component/Component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'packages/ui/src/components/{{kebabCase name}}/{{pascalCase name}}.css',
        templateFile: 'generators/templates/component/Component.css.hbs',
      },
      {
        type: 'add',
        path: 'packages/ui/src/components/{{kebabCase name}}/{{pascalCase name}}.test.tsx',
        templateFile: 'generators/templates/component/Component.test.tsx.hbs',
      },
      {
        type: 'add',
        path: 'packages/ui/src/components/{{kebabCase name}}/index.ts',
        templateFile: 'generators/templates/component/index.ts.hbs',
      },

      // 2. Append to packages/ui/src/index.ts
      {
        type: 'append',
        path: 'packages/ui/src/index.ts',
        template: "export * from './components/{{kebabCase name}}';",
      },

      // 3. Append @import to packages/ui/src/styles.css
      {
        type: 'append',
        path: 'packages/ui/src/styles.css',
        template: "@import './components/{{kebabCase name}}/{{pascalCase name}}.css';",
      },

      // 4. Update packages/ui/package.json exports
      function updatePackageJsonExports(answers) {
        const kebab = plop.getHelper('kebabCase')(answers.name);
        const pkgPath = path.resolve('packages/ui/package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

        if (!pkg.exports) pkg.exports = {};
        pkg.exports[`./${kebab}`] = {
          types: `./dist/components/${kebab}/index.d.ts`,
          import: `./dist/components/${kebab}/index.js`,
        };

        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        return `Updated packages/ui/package.json with "./${kebab}" export`;
      },
    ],
  });
}
