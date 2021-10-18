
const { execSync } = require('child_process');
const chalk = require('chalk');
const shell = require('shelljs');
const path = require('path');
const glob = require('glob');
const fs = require('fs');

function compileTypes() {
    console.log('Generating all types ...')
    execSync('./node_modules/typescript/bin/tsc -p tsconfig.lib.json', {
        stdio: 'inherit'
    })

    const locationOfTypes = path.resolve(__dirname, '..', 'types/src')
    const locationOfLib = path.resolve(__dirname, '..', 'lib')

    // Get all components in lib folder.
    // For each of them, copy the generated types in the @types folder into the generated lib/components/* folder, that way the types are available.
    // also copy over common.d.ts file and index.d.ts file.

    const filesAndFolders = fs.readdirSync(path.resolve(locationOfTypes, 'components'))
        .filter(name => ! name.endsWith('.d.ts'))

    filesAndFolders.forEach(component => {
        console.log(`
        Getting all types for ${component} component.
    `)
        const typeFiles = fs.readdirSync(path.resolve(locationOfTypes, 'components', component)).filter(t => ! t.endsWith('.test.d.ts'))

        const nestedFolders = typeFiles.filter(t => !t.endsWith('.d.ts'))

        typeFiles.forEach(file => {
            console.log(`Copying ${component} -> ${file} file...`)
            shell.cp(path.resolve(locationOfTypes, 'components', component, file), path.resolve(locationOfLib, 'components', component))
        })

        nestedFolders.forEach(nestedFolder => {
            const typeFiles = fs.readdirSync(path.resolve(locationOfTypes, 'components', component, nestedFolder)).filter(t => ! t.endsWith('.test.d.ts'))

            typeFiles.forEach(file => {
                console.log(`Copying ${component} -> ${nestedFolder} -> ${file} file...`)
                shell.cp(path.resolve(locationOfTypes, 'components', component, nestedFolder, file), path.resolve(locationOfLib, 'components', component, nestedFolder))
            })
        })
    })

    // Copy common.d.ts and index.d.ts file
    const topFiles = ['common.d.ts', 'index.d.ts']

    console.log(`
    Getting all top-level types.
`)

    topFiles.forEach(file => {
        console.log(`Copying ${file}...`)
        shell.cp(path.resolve(locationOfTypes, 'components', file), path.resolve(__dirname, '..', 'lib/components'))
    })

    // Copy services types
    console.log(`
    Copying all services...
`)
    const services = fs.readdirSync(path.resolve(locationOfTypes, 'services')).filter(s => !s.endsWith('.test.d.ts'))

    services.forEach(service => {
        if (service.endsWith('.d.ts')) {
            // is a top level file. copy it.
            shell.cp(path.resolve(locationOfTypes, 'services', service), path.resolve(locationOfLib, 'services', service))
        } else {
            // is a folder. go in, loop through all its files, and copy them.
            const files = fs.readdirSync(path.resolve(locationOfTypes, 'services', service)).filter(f => !f.endsWith('.test.d.ts'))

            files.forEach(file => {
                shell.cp(path.resolve(locationOfTypes, 'services', service, file), path.resolve(locationOfLib, 'services', service, file))
            })
        }
    })

    console.log(`
    Copying all themes...
`)
    // Copy themes
    const themes = fs.readdirSync(path.resolve(locationOfTypes, 'themes')).filter(s => !s.endsWith('.test.d.ts'))

    themes.forEach(file => {
        if (file.endsWith('.d.ts')) {
            shell.cp(path.resolve(locationOfTypes, 'themes', file), path.resolve(locationOfLib, 'themes', file))
        } else {
            const nestedFiles = fs.readdirSync(path.resolve(locationOfTypes, 'themes', file)).filter(f => !f.endsWith('.test.d.ts'))

            nestedFiles.forEach(nestedFile => {
                shell.cp(path.resolve(locationOfTypes, 'themes', file, nestedFile), path.resolve(locationOfLib, 'themes', file, nestedFile))
            })

            if (file === 'eui-amsterdam') {
                // copy global styling variables
                const globalStylesFiles = fs.readdirSync(path.resolve(locationOfTypes, 'themes', file, 'global_styling/variables'))
                
                globalStylesFiles.forEach(globalFile => {
                    shell.cp(path.resolve(locationOfTypes, 'themes', file, 'global_styling/variables', globalFile), path.resolve(locationOfLib, 'themes', file, 'global_styling/variables', globalFile))
                })
            }
        }
    })

    // Copy utils
    console.log(`
    Copying all utils...
`)
    const utils = fs.readdirSync(path.resolve(locationOfTypes, 'utils'))

    utils.forEach(util => {
        if (util.endsWith('.d.ts')) {
            // is a top level file. copy it.
            shell.cp(path.resolve(locationOfTypes, 'utils', util), path.resolve(locationOfLib, 'utils', util))
        } else {
            // is a folder. go in, loop through all its files, and copy them.
            const files = fs.readdirSync(path.resolve(locationOfTypes, 'utils', util))

            files.forEach(file => {
                shell.cp(path.resolve(locationOfTypes, 'utils', util, file), path.resolve(locationOfLib, 'utils', util, file))
            })
        }
    })

        // Copy all global styling
        console.log(`
    Copying all global styling...
`)

    const styling = fs.readdirSync(path.resolve(locationOfTypes, 'global_styling'))

    styling.forEach(style => {
        // is a folder. go in, loop through all its files, and copy them.
        const files = fs.readdirSync(path.resolve(locationOfTypes, 'global_styling', style))

        files.forEach(file => {
            shell.cp(path.resolve(locationOfTypes, 'global_styling', style, file), path.resolve(locationOfLib, 'global_styling', style, file))
        })
    })
}

compileTypes()
