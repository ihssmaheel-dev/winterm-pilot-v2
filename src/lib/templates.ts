import type { Tab, TreeNode, TemplateName } from '@/types'
import { uid } from '@/lib/utils'

function mkPane(name: string, dir = 'C:\\Projects\\my-project', cmds: string[] = ['code .', 'npm run dev']): TreeNode {
  return { id: uid(), type: 'pane', name, workingDirectory: dir, commands: [...cmds] }
}

function mkSplit(dir: 'horizontal' | 'vertical', children: TreeNode[], sizes: number[]): TreeNode {
  return { id: uid(), type: 'split', direction: dir, children, sizes }
}

const TEMPLATES: Record<TemplateName, () => { tabs: Tab[] }> = {
  fullstack() {
    return {
      tabs: [{
        id: uid(),
        name: 'App',
        root: mkSplit('vertical', [
          mkPane('Frontend', 'C:\\Projects\\client', ['npm run dev']),
          mkPane('Backend', 'C:\\Projects\\server', ['npm start']),
        ], [50, 50]),
      }],
    }
  },

  '3tier'() {
    return {
      tabs: [{
        id: uid(),
        name: 'Stack',
        root: mkSplit('vertical', [
          mkPane('Frontend', 'C:\\Projects\\web', ['npm run dev']),
          mkSplit('horizontal', [
            mkPane('API', 'C:\\Projects\\api', ['go run .']),
            mkPane('Database', 'C:\\Projects\\db', ['docker-compose up']),
          ], [50, 50]),
        ], [60, 40]),
      }],
    }
  },

  microservices() {
    return {
      tabs: [
        { id: uid(), name: 'Gateway', root: mkPane('Gateway', 'C:\\Projects\\gateway', ['npm start']) },
        {
          id: uid(),
          name: 'Services',
          root: mkSplit('vertical', [
            mkSplit('horizontal', [
              mkPane('Auth', 'C:\\Projects\\auth', ['npm run watch']),
              mkPane('Users', 'C:\\Projects\\users', ['npm run watch']),
            ], [50, 50]),
            mkSplit('horizontal', [
              mkPane('Payment', 'C:\\Projects\\pay', ['npm run watch']),
              mkPane('Notif', 'C:\\Projects\\notif', ['npm run watch']),
            ], [50, 50]),
          ], [50, 50]),
        },
      ],
    }
  },

  monorepo() {
    return {
      tabs: [{
        id: uid(),
        name: 'Monorepo',
        root: mkSplit('vertical', [
          mkSplit('horizontal', [
            mkPane('Web App', 'C:\\Monorepo\\apps\\web', ['pnpm dev']),
            mkPane('Mobile', 'C:\\Monorepo\\apps\\mobile', ['pnpm start']),
          ], [50, 50]),
          mkSplit('horizontal', [
            mkPane('API Server', 'C:\\Monorepo\\services\\api', ['pnpm dev']),
            mkPane('Worker', 'C:\\Monorepo\\services\\worker', ['pnpm start']),
          ], [50, 50]),
        ], [50, 50]),
      }],
    }
  },
}

export function loadTemplate(name: TemplateName): Tab[] {
  return TEMPLATES[name]().tabs
}
