//
//  MrControlerViewController.m
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/20/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#import "MrControllerViewController.h"

@interface MrControllerViewController ()<UIGestureRecognizerDelegate>

@end

@implementation MrControllerViewController

@synthesize lblInstruction = _lblInstruction;

- (id)initWithRootViewController:(MrRootViewController *)rootControler
{
    return [super initWithNibName:@"MrControllerViewController" bundle:nil root:rootControler];
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    
    UILongPressGestureRecognizer *pressRecognizer = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(press:)];
    pressRecognizer.minimumPressDuration = 0.01;
    pressRecognizer.delegate = self;
    [self.view addGestureRecognizer:pressRecognizer];
    [pressRecognizer release];
    
    UITapGestureRecognizer *tapRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(tap:)];
    tapRecognizer.delegate = self;
    [self.view addGestureRecognizer:tapRecognizer];
    [tapRecognizer release];
    
    [self performSelector:@selector(flashInstruction) withObject:nil afterDelay:1];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer{
    return YES;
}

- (void)flashInstruction
{
    if(_flashCount == 0)
        _flashCount = kMR_FLASH_COUNT;
    
    [UIView animateWithDuration:0.5 animations:^{
        if(_flashCount % 2 == 0)
            _lblInstruction.alpha = 1.0;
        else
            _lblInstruction.alpha = 0.0;
            
    } completion:^(BOOL finished) {
        if(--_flashCount > 0)
            [self flashInstruction];
    }];
}
     
-(void)tap:(id)sender
{
    UITapGestureRecognizer *recognizer = (UITapGestureRecognizer *)sender;
    
    if(recognizer.state == UIGestureRecognizerStateEnded)
    {
        CGSize size = self.view.frame.size;
        CGPoint p = [recognizer locationInView:self.view];
        p.x /= size.width;
        p.y /= size.height;
        
        std::shared_ptr<osc::OutboundPacketStream> oscOutput = self.oscOutput;
        
        oscOutput->Clear();
        *oscOutput << osc::BeginBundleImmediate
        << osc::BeginMessage( "/bo/b1/t" )
        << p.x << p.y<< osc::EndMessage
        << osc::EndBundle;
        
        std::cout << "tap end (" << p.x << "," << p.y << ")" << std::endl;
        
        [self send:oscOutput->Data() size:oscOutput->Size()];
    }
}

-(void)press:(id)sender
{
    UITapGestureRecognizer *recognizer = (UITapGestureRecognizer *)sender;
    
    if(recognizer.state == UIGestureRecognizerStateBegan)
    {
        CGSize size = self.view.frame.size;
        CGPoint p = [recognizer locationInView:self.view];
        p.x /= size.width;
        p.y /= size.height;
        
        std::shared_ptr<osc::OutboundPacketStream> oscOutput = self.oscOutput;
        
        oscOutput->Clear();
        *oscOutput << osc::BeginBundleImmediate
        << osc::BeginMessage( "/bo/b1/s" )
        << p.x << p.y<< osc::EndMessage
        << osc::EndBundle;
        
        std::cout << "press begin(" << p.x << "," << p.y << ")" << std::endl;
        
        [self send:oscOutput->Data() size:oscOutput->Size()];
    }
    else if(recognizer.state == UIGestureRecognizerStateChanged)
    {
        CGSize size = self.view.frame.size;
        CGPoint p = [recognizer locationInView:self.view];
        p.x /= size.width;
        p.y /= size.height;
        
        std::shared_ptr<osc::OutboundPacketStream> oscOutput = self.oscOutput;
        
        oscOutput->Clear();
        *oscOutput << osc::BeginBundleImmediate
        << osc::BeginMessage( "/bo/b1/c" )
        << p.x << p.y<< osc::EndMessage
        << osc::EndBundle;
        
        std::cout << "press changed (" << p.x << "," << p.y << ")" << std::endl;
        
        [self send:oscOutput->Data() size:oscOutput->Size()];
    }
    else if(recognizer.state == UIGestureRecognizerStateEnded)
    {
        CGSize size = self.view.frame.size;
        CGPoint p = [recognizer locationInView:self.view];
        p.x /= size.width;
        p.y /= size.height;
        
        std::shared_ptr<osc::OutboundPacketStream> oscOutput = self.oscOutput;
        
        oscOutput->Clear();
        *oscOutput << osc::BeginBundleImmediate
        << osc::BeginMessage( "/bo/b1/e" )
        << p.x << p.y<< osc::EndMessage
        << osc::EndBundle;
        
        std::cout << "press end (" << p.x << "," << p.y << ")" << std::endl;
        
        [self send:oscOutput->Data() size:oscOutput->Size()];
    }
}

@end
