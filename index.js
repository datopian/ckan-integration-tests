import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

// The strategy to dynamically load specs is to list all the specs in given a
// package path — and the path can be either the source of this package, or the
// root of a third-party package. `CKANIntegrationTests` calls (below) both in
// its constructor method.
const gatherSpecs = (source, specs) => {
  const filters = new Set()
  const dir = path.join(source, 'cypress', 'integration')
  const shouldAdd = (name) => {
    // if there is no filter, allow every file
    if (filters.size === 0) {
      return true
    }

    // filter matches the full file name
    if (filters.has(name)) {
      return true
    }

    // filter matches the file name without extensions
    if (filters.has(name.replace(/(\.spec)?\.js$/, ''))) {
      return true
    }

    return false
  }

  if (typeof specs === 'string') {
    filters.add(specs)
  }
  if (Array.isArray(specs)) {
    specs.forEach((spec) => filters.add(spec))
  }

  return fs
    .readdirSync(dir)
    .filter(shouldAdd)
    .map((name) => path.join(dir, name))
    .map((pth) => path.resolve(pth))
}

// The strategy for dynamically loading custom commands is to (a) write a
// custom `index.js` at a temporary location and, therem, import both
// `support/command.js` files (one from this package, and the other from the
// third-party one). Next, (b) we pass the path of this temporary file as the
// `supportFile` option to Cypress's run command.
const createSupportFile = (tmp, roots) => {
  const file = path.join(tmp, 'support', 'index.js')
  const contents = roots
    .map((dir) => path.join(dir, 'cypress', 'support', 'commands.js'))
    .map((pth) => path.resolve(pth))
    .map((pth) => `import '${pth}';`)
    .join('\n')

  if (!fs.existsSync(path.dirname(file))) {
    fs.mkdirSync(path.dirname(file))
  }
  fs.writeFileSync(file, contents)

  return file
}

// Finally, the strategy for dynamically loading fixtures is to copy all
// fixtures from both packages to a temporary location and pass the path of
// this temporary location as the `fixturesFolder` option to Cypress's run
// command.
const mergeFixtures = (tmp, roots) => {
  const dir = path.join(tmp, 'fixtures')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  roots
    .map((root) => path.join(root, 'cypress', 'fixtures'))
    .map((source) => {
      fs.readdirSync(source).map((name) =>
        fs.copyFileSync(path.join(source, name), path.join(dir, name))
      )
    })

  return dir
}

// The `CKANIntegrationTests` class handles the three abstractions in order to
// offer a proper `options` object to be used to run run Cypress, having in
// mind dynaminally loading specs, custom commands and fixtures from both this
// package and a third-party package that npm install this package.
class CKANIntegrationTests {
  constructor() {
    this.src = path.dirname(fileURLToPath(import.meta.url))
    this.roots = [this.src, '.'] // the 2nd is the 3rd party pkg's root
    this.tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ckan-uat-'))
    this.spec = []

    // The property `options` includes all relevant options to be used with
    // Cypress's run command.
    this.options = {
      spec: [],
      config: {
        integrationFolder: '.',
        fixturesFolder: mergeFixtures(this.tmp, this.roots),
        supportFile: createSupportFile(this.tmp, this.roots),
      },
    }

    // The method `addSpecs` takes the source (`this.src` for this package's
    // specs, or `'.'` for using a third-party package's specs, for example).
    // The optional `specs` arguments allows the user to specify which specs to
    // include.
    this.addSpecs = (source, specs = null) => {
      this.options.spec = this.options.spec.concat(gatherSpecs(source, specs))
    }

    // A shortcut calling `addSpecs` for all specs in this repo and in the
    // third-party repo.
    this.addAllSpecs = () => this.roots.map(this.addSpecs)

    // The method `cleanUp` delete all temporary files and directories created by
    // an instance of this class.
    this.cleanUp = () => fs.rmdirSync(this.tmp, { recursive: true })
  }
}

export { CKANIntegrationTests }
