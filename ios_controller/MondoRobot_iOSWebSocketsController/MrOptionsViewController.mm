//
//  MrOptionsViewController.m
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/20/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import "MrRootViewController.h"
#import "MrOptionsViewController.h"
#import "HostUtils.h"
#import "WebSocketServer.h"

#define kMrConnectionMessageFailed @"connection failed"
#define kMrConnectionMessageConnected @"connected"
#define kMrConnectionMessageNotConnected @"not connected"

@interface MrOptionsViewController ()


@end

@implementation MrOptionsViewController

@synthesize lblConnected = _lblConnected;
@synthesize lblMyAddress = _lblMyAddress;

- (id)initWithRootViewController:(MrRootViewController *)rootControler
{
    return [super initWithNibName:@"MrOptionsViewController" bundle:nil root:rootControler];
}

- (void)dealloc
{
    [super dealloc];

    self.lblConnected = nil;
    self.lblMyAddress = nil;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    _lblConnected.text = kMrConnectionMessageNotConnected;
    _lblMyAddress.text = [NSString stringWithFormat:@"ws://%@:%d", [NSString stringWithUTF8String:mr::HostUtils::getLocalIpAddress().c_str()], PORT];
    
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
