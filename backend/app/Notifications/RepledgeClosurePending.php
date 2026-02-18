<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RepledgeClosurePending extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public $loanNo;
    public $pledgeId;
    public $repledge;

    /**
     * Create a new notification instance.
     */
    public function __construct($loanNo, $pledgeId, $repledge)
    {
        $this->loanNo = $loanNo;
        $this->pledgeId = $pledgeId;
        $this->repledge = $repledge;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Repledge Closure Pending',
            'message' => "Loan #{$this->loanNo} closed. Active Repledge Found: #{$this->repledge->re_no} (Bank: {$this->repledge->source->name})",
            'pledge_id' => $this->pledgeId,
            'loan_no' => $this->loanNo,
            'repledge_id' => $this->repledge->id,
            'link' => "/re-pledge/{$this->repledge->id}",
            'type' => 'warning'
        ];
    }
}
