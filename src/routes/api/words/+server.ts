import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

import english from './languages/english.json'

export const GET: RequestHandler = ({ url }) => {
	const amount = Number(url.searchParams.get('amount'))
	const words = english.words.slice(0, amount)
	return json(words)
}
