package DDGC::DB::Result::GitHub::ReviewComment;
# ABSTRACT:

use Moose;
extends 'DDGC::DB::Base::Result';
use DBIx::Class::Candy;
use namespace::autoclean;

table 'github_review_comment';

primary_column id         => {data_type => 'bigint', is_auto_increment => 1};
unique_column  github_id  => {data_type => 'bigint', is_nullable => 0};
column github_repo_id     => {data_type => 'bigint', is_nullable => 0};
column github_user_id     => {data_type => 'bigint', is_nullable => 0};
column number             => {data_type => 'bigint', is_nullable => 0};
column diff_hunk          => {data_type => 'text',   is_nullable => 0};
column path               => {data_type => 'text',   is_nullable => 0};
column body               => {data_type => 'text',   is_nullable => 0};
column created_at         => {data_type => 'timestamp with time zone', is_nullable => 0};
column updated_at         => {data_type => 'timestamp with time zone', is_nullable => 0};
column gh_data            => {
    data_type        => 'text',
    is_nullable      => 0,
    serializer_class   => 'JSON',
    serializer_options => { convert_blessed => 1, pretty => 1 },
};

belongs_to github_repo => 'DDGC::DB::Result::GitHub::Repo',
    { 'foreign.id' => 'self.github_repo_id' },
    { on_delete    => 'cascade' };

belongs_to github_user => 'DDGC::DB::Result::GitHub::User',
    { 'foreign.id' => 'self.github_user_id' },
    { on_delete    => 'cascade' };

belongs_to github_pull => 'DDGC::DB::Result::GitHub::Pull',
    { 'foreign.number'         => 'self.number',
      'foreign.github_repo_id' => 'self.github_repo_id',
    },
    { on_delete => 'cascade' };

no Moose;
__PACKAGE__->meta->make_immutable( inline_constructor => 0 );
