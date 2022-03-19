import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ElasticsearchModule } from '@nestjs/elasticsearch'

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './controllers/user/user.controller';
import { UserService } from './services/user/user.service';
import { UserSchema } from './interfaces/user.interface';
import { PostSchema } from './interfaces/post.interface';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { jwtConstants } from './common/constants';
import { CommonModule } from './common/common.module';
import { VideoController } from './controllers/video/video.controller';
import { VideoService } from './services/video/video.service';
import { VideoSchema } from './interfaces/video.interface';
import { LocalStrategy } from './common/guards/local.strategy';
import { JwtStrategy } from './common/guards/jwt.strategy';
import { FacebookStrategy } from './common/guards/facebook.strategy';
import { GoogleStrategy } from './common/guards/google.strategy';
import { CourseController } from './controllers/course/course.controller';
import { CourseService } from './services/course/course.service';
import { CourseSchema } from './interfaces/course.interface';
import { CommentService } from './services/comment/comment.service';
import { CommentSchema } from './interfaces/comment.interface';
import { PostController } from './controllers/post/post.controller';
import { PostService } from './services/post/post.service';
import { FollowService } from './services/follow/follow.service';
import { FollowSchema } from './interfaces/follow.interface'
import { SearchController } from './controllers/search/search.controller';
import { NotificationSchema } from './interfaces/notification.interface'

import { HttpModule } from 'src/common/http/http.module';
import { PlaylistController } from './controllers/playlist/playlist.controller';
import { PlaylistService } from './services/playlist/playlist.service';
import { VideoPlaylistSchema } from './interfaces/playlist.interface'
import { CategoriesController } from './controllers/categories/categories.controller';
import { FeedController } from './controllers/feed/feed.controller';
import { NotificationService } from './services/notification/notification.service';
import { NotificationController } from './controllers/notification/notification.controller';
import { ClassroomController } from './controllers/classroom/classroom.controller';
import { ClassroomService } from './services/classroom/classroom.service';
import { ClassroomSchema } from './interfaces/classroom.interface';

const JWT_PRIVATE_KEY =  Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('ascii')
const JWT_PUBLIC_KEY = Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('ascii')
const DATABASE_CONNECTION = process.env.DATABASE_CONNECTION || "mongodb://localhost:27017/lermo"
const ELASTICSEARCH_CONNECTION = process.env.ELASTICSEARCH_CONNECTION || "http://localhost:9200"

@Module({
  imports: [
    HttpModule,
    ElasticsearchModule.register({
      node: ELASTICSEARCH_CONNECTION,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(DATABASE_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }),
    PassportModule,
    JwtModule.register({
      // algorithm: "RS256",
      // secret: jwtConstants.secret,
      publicKey:  JWT_PUBLIC_KEY,
      privateKey: {key: JWT_PRIVATE_KEY, passphrase: "lermo"},
      signOptions: { algorithm: "RS256", expiresIn: '30d', issuer: "lermo", },
    }),
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema, collection: "users" }]),
    MongooseModule.forFeature([{ name: 'post', schema: PostSchema, collection: "posts" }]),
    MongooseModule.forFeature([{ name: 'video', schema: VideoSchema, collection: "videos" }]),
    MongooseModule.forFeature([{ name: 'course', schema: CourseSchema, collection: "courses" }]),
    MongooseModule.forFeature([{ name: 'comment', schema: CommentSchema, collection: "comments" }]),
    MongooseModule.forFeature([{ name: 'follow', schema: FollowSchema, collection: "follows" }]),
    MongooseModule.forFeature([{ name: 'playlist', schema: VideoPlaylistSchema, collection: "playlists" }]),
    MongooseModule.forFeature([{ name: 'notification', schema: NotificationSchema, collection: "notifications" }]),
    MongooseModule.forFeature([{ name: 'classroom', schema: ClassroomSchema, collection: "classrooms" }]),
    CommonModule,
  ],
  controllers: [AppController, UserController, AuthController, VideoController, CourseController, PostController, SearchController, PlaylistController, CategoriesController, FeedController, NotificationController, ClassroomController],
  providers: [
    AppService,
    UserService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
    VideoService,
    CourseService,
    CommentService,
    PostService,
    FollowService,
    PlaylistService,
    NotificationService,
    ClassroomService,
  ],
})
export class AppModule {}
