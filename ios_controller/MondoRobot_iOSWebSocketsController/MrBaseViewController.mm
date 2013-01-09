//
//  MrBaseViewController.m
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/20/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import "MrBaseViewController.h"
#import "MrRootViewController.h"

@interface MrBaseViewController ()

@end

@implementation MrBaseViewController

@synthesize rootViewController = _rootViewController;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil root:(MrRootViewController *)rootControler
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if(self != nil)
    {
        self.rootViewController = rootControler;
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (mr::WebSocketServerPtr)server
{
    return _rootViewController.server;
}

- (std::shared_ptr<osc::OutboundPacketStream>)oscOutput
{
    return _rootViewController.oscOutput;
}

- (void)send:(const char *)data size:(size_t)size
{
    [_rootViewController send:data size:size];
}

- (void)connectionFailed
{
    
}

- (void)connectionOpened
{
    
}

- (void)connectionClosed
{
    
}

@end
