import MongoDB from '../common/mongodb'

class memory_database
{
	connect()
	{
		this.db = {}
		this.id = 1

		return Promise.resolve()
	}

	get_batch(skip, amount)
	{
		const result = {}

		let i = 0
		for (let key of Object.keys(this.db))
		{
			if (skip)
			{
				skip--
			}
			else if (amount)
			{
				result[key] = this.db[key]
				amount--
			}
			else
			{
				break
			}

			i++
		}

		return Promise.resolve(result)
	}

	get(id)
	{
		return Promise.resolve(this.db[id])
	}

	create(user, type, info)
	{
		const id = this.id
		this.id++

		this.db[id] =
		{
			user    : user.id,
			created : new Date(),
			type,
			info
		}

		return Promise.resolve(id)
	}

	delete(id)
	{
		delete this.db[id]
		return Promise.resolve()
	}

	async increase_user_images_size(user, size)
	{
		return Promise.resolve()
	}

	async decrease_user_images_size(user, size)
	{
		return Promise.resolve()
	}
}

class mongodb_database extends MongoDB
{
	async get_batch(skip, amount)
	{
		return this.collection('images').query({}, { skip, amount })
	}

	async get(id)
	{
		let result = await this.collection('images').get_by_id(id)

		// Convert `_id` ObjectId to `id` string
		result = this.to_object(result)
		
		// Convert ObjectId to string
		result.user = result.user.toString()

		return result
	}

	async create(user, type, info)
	{
		const result = await this.collection('images').insertAsync
		({
			user    : this.ObjectId(user.id),
			created : new Date(),
			type,
			info
		})

		return this.inserted_id(result).toString()
	}

	async delete(id)
	{
		await this.collection('images').remove_by_id(id)
	}

	async increase_user_images_size(user, size)
	{
		const result = await this.collection('user_image_stats').updateAsync
		({
			user: this.ObjectId(user.id)
		},
		{
			$inc:
			{
				files_size : size,
				count      : 1
			}
		})

		if (!result.result.nModified)
		{
			await this.collection('user_image_stats').insertAsync
			({
				user       : this.ObjectId(user.id),
				files_size : size,
				count      : 1
			})
		}
	}

	async decrease_user_images_size(user, size)
	{
		await this.collection('user_image_stats').updateAsync
		({
			user: this.ObjectId(user.id)
		},
		{
			$inc:
			{
				files_size : -size,
				count      : -1
			}
		})
	}
}

const database = configuration.mongodb ? new mongodb_database() : new memory_database()
// const database = new memory_database()

export function connect()
{
	return database.connect()
}

export default database