import inspect from 'object-inspect'
import { memoize } from './utils'

const load = memoize(url =>
  new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.async = false
    el.charset = 'utf-8'
    el.src = url
    document.body.appendChild(el)
    el.onload = resolve
    el.onerror = err => {
      reject('Could not load compiler from ' + url + '\n\n' + inspect(err))
    }
  })
)

const compilers = {
  styl: file => load('https://cdn.rawgit.com/stylus/stylus-lang.com/615e6e5d33e0954f9a89cf9d6d18fdc7062a87fd/try/stylus.min.js').then(() => ({
    code: window.stylus.render(file.content)
  })),
  scss: file => load('https://unpkg.com/sass.js@0.10.9/dist/sass.sync.js').then(() =>
    new Promise((resolve, reject) =>
      window.Sass.compile(file.content, result => {
        result.message
          ? reject(result.message)
          : resolve({ code: result.text })
      })
    )
  ),
  sass: file => load('https://unpkg.com/sass.js@0.10.9/dist/sass.sync.js').then(() =>
    new Promise((resolve, reject) =>
      window.Sass.compile(file.content, {
        indentedSyntax: true
      }, result => {
        result.message
          ? reject(result.message)
          : resolve({ code: result.text })
      })
    )
  ),
  less: file => load('https://unpkg.com/less@3.0.1/dist/less.js').then(() =>
    window.less.render(file.content).then(result => ({ code: result.css }))
  ),
  ts: file => load('https://unpkg.com/typescript@2.4.2/lib/typescriptServices.js').then(() => {
    const result = window.ts.transpileModule(file.content, {
      fileName: file.name,
      compilerOptions: {
        sourceMap: true,
        jsx: 'react'
      }
    })

    return {
      code: result.outputText.substring(0, result.outputText.lastIndexOf('\n')),
      map: result.sourceMapText
    }
  }),
  babel: file => load('https://unpkg.com/@babel/standalone@7.0.0-beta.42/babel.min.js').then(() =>
    window.Babel.transform(file.content, {
      presets: ['es2015', 'stage-2', 'react'],
      sourceMaps: true,
      sourceFileName: file.name
    })
  ),
  ls: file => load('https://cdn.rawgit.com/gkz/LiveScript/12f0cc856a02c8065a0ab18696a6df6e272b10bd/browser/livescript-min.js').then(() => {
    if (!window.livescript)
      window.livescript = window.require('livescript')

    const result = window.livescript.compile(file.content, {
      map: 'linked',
      filename: file.name
    })

    return {
      code: result.code,
      map: result.map.toString()
    }
  }),
  coffee: file => Promise.all([
    load('https://unpkg.com/@babel/standalone@7.0.0-beta.42/babel.min.js'),
    load('https://cdn.rawgit.com/jashkenas/coffeescript/001f97ac399dbcbf2bdcc32e4f2fc9fca4d6869f/docs/v2/browser-compiler/coffeescript.js')
  ]).then(() => {
    const coffee = window.CoffeeScript.compile(file.content, {
      sourceMap: true,
      filename: file.name
    })

    const data = window.Babel.transform(coffee.js, {
      presets: ['es2015', 'stage-2', 'react'],
      sourceMaps: true,
      inputSourceMap: JSON.parse(coffee.v3SourceMap),
      sourceFileName: file.name
    })

    return data
  })
}

export default compilers
