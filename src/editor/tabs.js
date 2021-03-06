import m from 'mithril'
import b from 'bss'

import icon from '../components/icon'
import lockIcon from '../icons/lock.svg'

export default (model, actions) =>
  m('nav'
    + b
      .minHeight(38)
      .d('flex')
      .c('gray')
      .w('100%')
      .background('rgb(246,246,246)')
      .fontSize(14)
    ,
    m('.tabs'
      + b.d('flex')
        .minHeight(38)
        .overflowX('auto')
        .overflowY('hidden')
        .flexGrow(1)
      ,
        model.state.fileTabs && fileTabs(model, actions)
      ,
        model.state.linkTabs && linkTabs(model, actions)
    )
  )

function linkTabs(model, actions) {
  return model.state.links.map(link =>
    tab(
      m('div' + b.d('flex'),
        m('a' + b.c('inherit'), {
          href: link.url,
          target: '_blank',
          onclick: e => link.content && e.preventDefault()
        }, link.name),
        link.editable === false && icon({ size: 16, class: b.ml(6).class }, lockIcon)
      ),
      () => link.content && actions.select(link.url),
      link === model.selectedFile(),
      model
    )
  )
}

function fileTabs(model, actions) {
  return model.state.files.map(file =>
    tab(
      m('div' + b.d('flex'),
        file.name,
        file.editable === false && icon({ size: 16, class: b.ml(6).class }, lockIcon)
      ),
      () => actions.select(file.name),
      file === model.selectedFile(),
      model
    )
  )
}

function tab(title, onclick, selected, model) {
  return m('.tab'
   + b.d('flex')
    .ai('center')
    .transition('background .3s, color .3s')
    .minWidth(40)
    .maxWidth(200)
    .cursor('pointer')
    .flexShrink(2)
    .$hover(
      b
      .flexShrink(0)
      .background('#ddd')
      .c('#333')
    )
  , {
    style: selected
      ? b
      .background(model.state.color)
      .h(40)
      .zi(1)
      .c('white')
      .flexShrink(0)
      .style
      : {},
    onclick: onclick
  },
    m('span'
      + b.flexGrow(1)
      .overflow('hidden')
      .ta('center')
      .whiteSpace('nowrap')
      .p('0 12px')
    ,
      title
    )
  )
}
