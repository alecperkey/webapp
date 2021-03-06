import { http, errors } from 'web-service'

import store from '../store'
import { get_user } from './user.base'

export default function(api)
{
	api.get('/:id', async function({ id }, { user })
	{
		return await get_user({ id }, { user })
	})

	api.post('/', async function(user)
	{
		if (!exists(user.name))
		{
			throw new errors.Input_missing(`"name" is required`)
		}

		await store.create_user(user)
	})

	// api.patch('/settings', async function({ xxx }, { user })
	// {
	// 	if (!user)
	// 	{
	// 		throw new errors.Unauthenticated()
	// 	}
	//
	// 	await store.update_user(user.id, { xxx })
	// })

	api.patch('/email', async function({ email }, { user, authentication_token, internal_http })
	{
		if (!email)
		{
			throw new errors.Input_missing('email')
		}

		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		await store.update_user(user.id, { email })

		await internal_http.patch(`${address_book.authentication_service}/email`, { email })
	})

	api.patch('/', async function(data, { user })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}
		
		await store.update_user(user.id,
		{
			name    : data.name,
			country : data.country,
			place   : data.place
		})

		return await get_user({ id: user.id }, { user })
	})

	api.post('/picture', async function(picture, { user, authentication_token, internal_http })
	{
		if (!user)
		{
			throw new errors.Unauthenticated()
		}

		const user_data = await get_user(user, { user })

		picture = await internal_http.post
		(
			`${address_book.image_service}/api/save`,
			{ type: 'user_picture', image: picture }
		)

		await store.update_user(user.id, { picture })

		if (user_data.picture)
		{
			await internal_http.delete(`${address_book.image_service}/api/${user_data.picture.id}`)
		}

		return picture
	})

	// api.patch('/locale', async function()
	// {
	// 	await set_locale.apply(this, arguments)
	// })

	// api.patch('/:id', async function({ id, name })
	// {
	// 	id = parseInt(id)

	// 	const user = await store.find_user_by_id(id)

	// 	if (!user)
	// 	{
	// 		throw new errors.Not_found(`User not found`)
	// 	}

	// 	user.name = name

	// 	await store.update_user(user)
	// })

	// api.post('/:id/picture', async function({ id, file_name })
	// {
	// 	const user = await store.find_user_by_id(id)

	// 	if (!user)
	// 	{
	// 		throw new errors.Not_found(`User not found`)
	// 	}

	// 	user.picture = file_name

	// 	await store.update_user(user)
	// })
}