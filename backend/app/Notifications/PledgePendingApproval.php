<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Channels\WebPushChannel;

class PledgePendingApproval extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $pledgeId;
    public $amount;
    public $loanNo;

    /**
     * Create a new notification instance.
     */
    public function __construct($pledgeId, $amount, $loanNo)
    {
        $this->pledgeId = $pledgeId;
        $this->amount = $amount;
        $this->loanNo = $loanNo;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable)
    {
        return [
            'title' => 'Approval Required',
            'body' => "Loan #{$this->loanNo} (₹{$this->amount}) requires admin approval.",
            'icon' => '/assets/nsh/auralendr.png',
            'data' => [
                'url' => '/approvals' // Opens the approvals page
            ],
            'actions' => [
                ['action' => 'view', 'title' => 'View']
            ]
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'approval_request',
            'pledge_id' => $this->pledgeId,
            'amount' => $this->amount,
            'message' => "New Pledge Approval Request: Loan #{$this->loanNo} (₹{$this->amount})",
            'url' => '/approvals' // Frontend route
        ];
    }
}
