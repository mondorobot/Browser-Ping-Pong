//
//  MrViewController.h
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/18/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <memory>
#import <iostream>
#import "WebSocketServer.h"
#import "osc/OscOutboundPacketStream.h"
#import "MrBaseViewController.h"

#define OUTPUT_BUFFER_SIZE 1024

@interface MrTestViewController : MrBaseViewController
{
    mr::WebSocketServerPtr _server;
    std::shared_ptr<osc::OutboundPacketStream> _oscOutput;
    char *_buffer;
}

@property (nonatomic, retain) IBOutlet UIScrollView *scrollView;
@property (nonatomic, retain) IBOutlet UIView       *scrollChild;

- (id)initWithRootViewController:(MrRootViewController *)rootControler;

@end
