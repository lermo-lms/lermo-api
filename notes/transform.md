
[Serialization](https://docs.nestjs.com/techniques/serialization)
[api-nestjs-serializing-response-interceptors](https://wanago.io/2020/06/08/api-nestjs-serializing-response-interceptors/)

[nestjs-transform-responses](https://stackoverflow.com/questions/56213878/nestjs-transform-responses)



[](https://stackoverflow.com/questions/59547243/create-dtos-bos-and-daos-for-nestjs-rest-api)


I handle this by having a single class to represent a User (internally and externally) with the class-transformer library (recommended by NestJs) to handle the differences between the exposed user and the internal user without defining two classes.

Here's an example using your user model:

Defining the User Class
Since this user class is saved to the database, I usually create a base class for all the fields that every database object expects to have. Let's say:

```ts
export class BaseDBObject {
  // this will expose the _id field as a string
  // and will change the attribute name to `id`
  @Expose({ name: 'id' })
  @Transform(value => value && value.toString())
  @IsOptional()
  // tslint:disable-next-line: variable-name
  _id: any;

  @Exclude()
  @IsOptional()
  // tslint:disable-next-line: variable-name
  _v: any;

  toJSON() {
    return classToPlain(this);
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}

```
Next, our user will expend this basic class:

```ts
@Exclude()
export class User extends BaseDBObject {
  @Expose()
  username: string;

  password: string;

  constructor(partial: Partial<User> = {}) {
    super();
    Object.assign(this, partial);
  }
}
```

I'm using a few decorators here from the class-transformer library to change this internal user (with all the database fields intact) when we expose the class outside of our server.

@Expose - will expose the attribute if the class-default is to exclude
@Exclude - will exclude the property if the class-default is to expose
@Transform - changes the attribute name when 'exporting'
This means that after running the classToPlain function from class-transformer, all the rules we defined on the given class will be applied.

Controllers
NestJs have a decorator you add to make sure classes you return from controller endpoints will use the classToPlain function to transform the object, returning the result object with all the private fields omitted and transformations (like changing _id to id)

```ts
@Get(':id')
@UseInterceptors(ClassSerializerInterceptor)
async findById(@Param('id') id: string): Promise<User> {
  return await this.usersService.find(id);
}

@Post()
@UseInterceptors(ClassSerializerInterceptor)
async create(@Body() createUserBody: CreateUserBodyDTO): Promise<User> {
  // create a new user from the createUserDto
  const userToCreate = new User(createUserBody);

  return await this.usersService.create(userToCreate);
}

```


Services

```ts
@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) { }

  async create(createCatDto: User): Promise<User> {
    const userToCreate = new User(createCatDto);
    const createdUser = await this.userModel.create(userToCreate);

    if (createdUser) {
      return new User(createdUser.toJSON());
    }
  }

  async findAll(): Promise<User[]> {
    const allUsers = await this.userModel.find().exec();
    return allUsers.map((user) => new User(user.toJSON()));
  }

  async find(_id: string): Promise<User> {
    const foundUser = await this.userModel.findOne({ _id }).exec();
    if (foundUser) {
      return new User(foundUser.toJSON());
    }
  }
}
```

Because internally we always use the User class, I convert the data returned from the database to a User class instance.

I'm using @nestjs/mongoose, but basically after retrieving the user from the db, everything is the same for both mongoose and TypeORM.

Caveats
With @nestjs/mongoose, I can't avoid creating IUser interface to pass to the mongo Model class since it expects something that extends the mongodb Document

```ts

export interface IUser extends mongoose.Document {
  username: string;

  password: string;
}
When GETting a user, the API will return this transformed JSON:

{
    "id": "5e1452f93794e82db588898e",
    "username": "username"
}

```

Here's the code for this example in a GitHub repository.

Hope this helped!

Update
If you want to see an example using typegoose to eliminate the interface as well (based on this blog post), take a look here for a model, and here for the base model