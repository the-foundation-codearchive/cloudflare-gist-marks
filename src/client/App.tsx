import React from 'react'
import { useState, useEffect, FormEventHandler, ChangeEventHandler } from 'react'
import { getParam, removeParam, isURL } from '../util'
import { Link, ListResult } from '../types'
import { List } from './Link'
import { InfoAlert } from './Alert'
import { Delete } from './Delete'
import { More } from './More'

import { Navbar, Container, Form, Button } from 'react-bootstrap'

const App = () => {
  const [links, setLinks] = useState<Link[]>([])
  const [url, setURL] = useState(getParam('url') || '')
  const [cat, setCAT] = useState(getParam('cat') || '')
  const [title, setTITLE] = useState(getParam('title') || '')

  const [showInfo, setShowInfo] = useState({ show: false, url: url })
  const [cursor, setCursor] = useState('')
  const [listComplete, setListComplete] = useState(false)


  const handleChangeCAT: ChangeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCAT(e.target.value)

  const handleChangeURL: ChangeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    setURL(e.target.value)

    const handleChangeTITLE: ChangeEventHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTITLE(e.target.value)

  const handleSubmit: FormEventHandler = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault()
    createNewLink()
  }

  const loadNextPage = async () => {
    console.log('loadNextPage')
    await fetchData()
  }

  const fetchData = async () => {
    const query = new URLSearchParams({ cursor: cursor, limit: '10' })
    const url = `/links_get?${query}`
    const response = await fetch(url)
    const data: ListResult = await response.json()
    if (listComplete === false) {
      setLinks([...links, ...data.bookmarks])
      setCursor(data.cursor || '')
      setListComplete(data.complete)
    }
  }
  

  useEffect(() => {
    fetchData()
  }, [])

  const createNewLink = async () => {
    removeParam()

    if (!isURL(url)) {
      return
    }

    const body = JSON.stringify({ url: url })
    const headers = {
      'Content-Type': 'application/json',
    }
    const response = await fetch('/link_add', { method: 'POST', headers, body })
    if (!response.ok) {
      console.log("failed addding link for "+url)
      return
    }
    setShowInfo({ show: true, url: url })
    setURL('')
    fetchData()
  }

  return (
    <div>
      <Navbar>
        <Container>
          <Navbar.Brand className='w-full text-center mx-auto' href='/'>
            <h1 className='text-2xl font-bold'> Gist Marks</h1>
          </Navbar.Brand>
        </Container>
          <Navbar.Brand className='align-right text-center mx-auto' href='/'>
          </Navbar.Brand>
      </Navbar>

      <Container fluid='sm' className='pb-2 px-4'>
        <div className='flex justify-center items-center'>
          <Form className='w-full flex flex-col pt-2 pb-4' onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Control
                value={url}
                onChange={handleChangeURL}
                className='text-white shadow border roundme border-gray-300 focus:outline-none focus:shadow-outline
              px-3 mb-3'
                type='text'
                placeholder='URL'
              />
              <Form.Control
                value={cat}
                onChange={handleChangeCAT}
                className='text-white shadow border roundme border-gray-300 focus:outline-none focus:shadow-outline
              px-3 mb-3'
                type='text'
                placeholder='category (defaults to default)'
              />
              <Form.Control
                value={title}
                onChange={handleChangeTITLE}
                className='text-white shadow border roundme border-gray-300 focus:outline-none focus:shadow-outline
              px-3 mb-3'
                type='text'
                placeholder='title ( by default taken from og:image or html title'
              />
            </Form.Group>
            <Button
              type='submit'
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold roundme py-2 px-4 text-sm'
            >
              Add
            </Button>
          </Form>
        </div>

        <InfoAlert showInfo={showInfo} setShowInfo={setShowInfo}></InfoAlert>
        <hr className='mt-2 mb-4' />
        <div>
          <div className='items-center justify-center'>
            {links.map((link) => (
              <List key={link.url} link={link} />
            ))}
          </div>
        </div>
        <div>
          <More loadNextPage={loadNextPage}></More>
        </div>
      </Container>
      <div id="deletecontainer" className="deletecontainer align-right">
        <Container>
        <Delete />
        </Container>
      </div>
    </div>

  )
}

export default App
