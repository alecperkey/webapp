import { MongoClient, ObjectId } from 'mongodb'

Promise.promisifyAll(MongoClient)

export default class MongoDB
{
	collections = {}

	constructor()
	{
		this.ObjectId = ObjectId
	}

	async connect()
	{
		this.db = await MongoClient.connect(`mongodb://${configuration.mongodb.user}:${configuration.mongodb.password}@${configuration.mongodb.host}:${configuration.mongodb.port}/${configuration.mongodb.database}`,
		{
			// https://docs.mongodb.org/manual/reference/write-concern/
			db: { w: 'majority' } 
		})
	}

	collection(name)
	{
		let collection = this.collections[name]

		if (!collection)
		{
			collection = this.db.collection(name)
			
			if (collection.create)
			{
				throw new Error(`"create" method already defined on MongoDB collection`)
			}

			collection.get_by_id = function(id)
			{
				return collection.findOneAsync({ _id: ObjectId(id) })
			}
			
			collection.update_by_id = function(id, actions)
			{
				return collection.updateOneAsync({ _id: ObjectId(id) }, actions)
			}
			
			collection.remove_by_id = function(id)
			{
				return collection.removeAsync({ _id: ObjectId(id) })
			}

			collection.query = function(filter, options = {})
			{
				const { amount, skip, sort } = options

				let result = collection.find(filter)

				if (amount)
				{
					result = result.limit(amount)
				}

				if (skip)
				{
					result = result.skip(skip)
				}

				if (sort)
				{
					result = result.sort(sort)
				}

				return Promise.promisify(result.toArray, result)()
			}

			this.collections[name] = collection
			Promise.promisifyAll(collection)
		}

		return collection
	}

	// Converts mongodb entity to JSON object
	// (`_id` ObjectId -> `id` string)
	to_object(entity)
	{
		if (!entity)
		{
			return
		}

		const object = entity //.toObject()
		object.id = object._id.toString()
		delete object._id

		return object
	}

	// Converts mongodb entity to JSON object
	// (`_id` ObjectId -> `id` string)
	to_objects(array)
	{
		let i = 0
		while (i < array.length)
		{
			array[i] = this.to_object(array[i])
			i++
		}

		return array
	}

	// returns ObjectID of the inserted JSON object
	inserted_id(result)
	{
		return result.ops[0]._id
	}
}