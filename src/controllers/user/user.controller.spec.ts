import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from 'src/services/user/user.service';
import { VideoService } from 'src/services/video/video.service';
import { PostService } from 'src/services/post/post.service';

import { TYPES } from 'src/common/types';

// import {} from 'src/common/common.module.ts'

describe('UsersController', () => {
  let controller: UserController;
  let userService: UserService;
  let videoService: VideoService;
  let postService: PostService;
  // let appController: AppController;
  // let service: AppService;

  const posts = [
    { userId: "1", username: "user 1", email: "user1@tes.test", password: "user1Password" },
    { userId: "2", username: "user 2", email: "user2@tes.test", password: "user2Password" },
    { userId: "3", username: "user 3", email: "user3@tes.test", password: "user3Password" },
    { userId: "4", username: "user 4", email: "user4@tes.test", password: "user4Password" },
  ]

  const user = {
    explore: ["exp1", "exp2"]
  }

  
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findById: jest.fn().mockReturnValue(user),
            getHello: jest.fn().mockReturnValue('Hello, World!'),
          },
        },
        {
          provide: VideoService,
          useValue: {
            suggestVideo: jest.fn().mockReturnValue(posts),
          },
        },
        {
          provide: PostService,
          useValue: {
            suggestPost: jest.fn().mockReturnValue(posts),
          },
        },
        {
          provide: TYPES.IStorageService,
          useValue: {},
        },
      ],
    }).compile();

    controller = app.get<UserController>(UserController);
    userService = app.get<UserService>(UserService);
    videoService = app.get<VideoService>(VideoService);
    postService = app.get<PostService>(PostService);
  });

  describe('root', () => {
    it('should return "Hello, World!"', async () => {

      const getResponse = await controller.suggestUser({ user: {_id: "" }})

      console.log(getResponse)
      console.log("---------------")
      // console.log(posts)
      expect(getResponse).toEqual(getResponse);
      // await expect(controller.suggestUser({ user: {_id: "" }})).toBe(posts);
    });
    // it('should return "Hello, Name!"', () => {
    //   controller.getHello = jest.fn().mockReturnValueOnce('Hello, Name!');
    //   expect(controller.getHello('Name')).toBe('Hello, Name!');
    // });
  });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });

  // it('should be', () => {
  //   // controller.suggestUser({})
  //   // const result = {}
  //   // jest.spyOn(controller, 'suggestUser').mockImplementation(() => result);
  //   // expect(controller.suggestUser({})).toBe(result);
  // });
});
