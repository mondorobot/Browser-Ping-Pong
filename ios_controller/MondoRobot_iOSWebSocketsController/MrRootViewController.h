//
//  MrRootViewController.h
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/20/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "WebSocketServer.h"
#import "osc/OscOutboundPacketStream.h"

#import "MrBaseViewController.h"
#import "MrTurnDeviceViewController.h"
#import "MrTestViewController.h"
#import "MrControllerViewController.h"
#import "MrOptionsViewController.h"

@interface MrRootViewController : UIViewController<MrViewControllerProtocol>
{
    MrTurnDeviceViewController *_turnDeviceViewController;
    MrOptionsViewController    *_optionsViewController;
    MrControllerViewController *_controllerViewController;
    MrTestViewController       *_testViewController;
    
    mr::WebSocketServerPtr _server;
    std::shared_ptr<osc::OutboundPacketStream> _oscOutput;
    char *_buffer;
    BOOL _isInitialized;
    BOOL _isRunning;
    BOOL _showControllerOnConnect;
    BOOL _isConnected;
}

@property (nonatomic, readonly) mr::WebSocketServerPtr server;
@property (nonatomic, readonly) std::shared_ptr<osc::OutboundPacketStream> oscOutput;

- (void)send:(const char *)data size:(size_t)size;

- (void)didEnterBackground;
- (void)didEnterForeground;

@end
