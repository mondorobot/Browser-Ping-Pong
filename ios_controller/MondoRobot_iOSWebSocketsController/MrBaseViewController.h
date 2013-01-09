//
//  MrBaseViewController.h
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/20/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "WebSocketServer.h"
#import "osc/OscOutboundPacketStream.h"

@protocol MrViewControllerProtocol <NSObject>

@required
- (void)connectionFailed;
- (void)connectionOpened;
- (void)connectionClosed;

@end

@class MrRootViewController;

@interface MrBaseViewController : UIViewController<MrViewControllerProtocol>

@property (nonatomic, assign) MrRootViewController  *rootViewController;
@property (nonatomic, readonly) mr::WebSocketServerPtr server;
@property (nonatomic, readonly) std::shared_ptr<osc::OutboundPacketStream> oscOutput;


- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil root:(MrRootViewController *)rootControler;
- (void)send:(const char *)data size:(size_t)size;

@end
